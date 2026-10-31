// Where the website gets its products from.
//
//   The CATALOGUE lives in src/data/products.ts: names, photos, descriptions and
//   the normal price. It ships with the site, so a new product appears the moment
//   it is deployed. Nothing has to be copied anywhere by hand.
//
//   The Google Sheet (tab "Products") holds what CHANGES day to day: stock counts,
//   any price you override, whether a product is hidden, and any photo you upload
//   in Admin. Those rows are matched to the catalogue by id and layered on top.
//
//   Products you add yourself in Admin live only in the sheet, and are shown too.
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types";
import { readTab, sheetsConfigured } from "@/lib/sheets";
import { rowToProduct, type SheetProduct } from "@/lib/productRows";
import { nutritionImageFor } from "@/data/nutrition";

/** a product is shown in the shop only once it has a price */
const priced = (p: Product) => p.price > 0 || (p.sizes?.some((x) => x.price > 0) ?? false);

/**
 * Every product on the shop must have both of its gallery slides: the pack photo
 * and the nutrition label. Anything without both is left out rather than shown
 * half-finished.
 */
const hasBothSlides = (p: Product) => Boolean(p.image) && Boolean(nutritionImageFor(p.image));

const SHIPPED_IMAGES = new Set(PRODUCTS.map((p) => p.image).filter(Boolean) as string[]);

/** true when the sheet's photo is a real one, not a stale path we no longer ship */
function usableImage(image: string | undefined) {
  if (!image) return false;
  if (!image.startsWith("/images/")) return true; // an upload or a full URL
  return SHIPPED_IMAGES.has(image);
}

/** one catalogue product with the sheet's live values layered on top */
function merge(base: Product, row?: SheetProduct): Product {
  if (!row) return base;
  return {
    ...base,
    price: row.price > 0 ? row.price : base.price,
    mrp: row.mrp ?? base.mrp,
    sizes: row.sizes ?? base.sizes,
    flavours: row.flavours ?? base.flavours,
    stock: row.stock,
    inStock: row.inStock,
    image: usableImage(row.image) ? row.image : base.image,
  };
}

/** drops the admin-only fields so the shop gets a plain Product */
function stripAdminFields(p: Product & { active: boolean; row?: number }): Product {
  const copy: Product & { active?: boolean; row?: number } = { ...p };
  delete copy.active;
  delete copy.row;
  return copy;
}

/** The whole catalogue, including anything hidden. Admin uses this. */
export async function buildCatalogue(): Promise<(Product & { active: boolean; row?: number })[]> {
  let rows: (SheetProduct & { row: number })[] = [];
  if (sheetsConfigured()) {
    try {
      rows = (await readTab("Products"))
        .map((r) => {
          const p = rowToProduct(r);
          return p ? { ...p, row: r._row } : null;
        })
        .filter((p): p is SheetProduct & { row: number } => p !== null);
    } catch (e) {
      console.error("[catalog] could not read the Google Sheet, using the built-in catalogue:", e);
    }
  }
  const byId = new Map(rows.map((r) => [r.id, r]));

  // every catalogue product, with its sheet row layered on if there is one
  const merged = PRODUCTS.map((base) => {
    const row = byId.get(base.id);
    return { ...merge(base, row), active: row ? row.active : true, row: row?.row };
  });

  // Rows whose id is not in the catalogue are leftovers from the old design, when
  // the sheet itself held the product list. They are ignored: the catalogue decides
  // what exists, the sheet only says how much is in stock.
  return merged;
}

/** Public product list: priced, not hidden. Cached briefly; Admin edits refresh it at once. */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("products");

  const all = await buildCatalogue();
  return all
    .filter((p) => p.active && priced(p) && hasBothSlides(p))
    .map(stripAdminFields);
}

/** One product by id. */
export async function findProduct(id: number): Promise<Product | undefined> {
  const hit = (await getProducts()).find((p) => p.id === id);
  if (hit || !sheetsConfigured()) return hit;
  await connection(); // a product added seconds ago: look again, at request time
  const all = await buildCatalogue();
  const p = all.find((x) => x.id === id);
  if (!p || !p.active || !priced(p) || !hasBothSlides(p)) return undefined;
  return stripAdminFields(p);
}

export type AdminProduct = Product & { active: boolean; row?: number };

/** Admin view: the whole catalogue, hidden products included, never cached. */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  return buildCatalogue();
}

/** The photo uploaded in Admin for one product, if there is one. */
export async function getProductImage(
  id: number,
): Promise<{ type: string; base64: string } | null> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 300, expire: 3600 });
  cacheTag("products");

  if (!sheetsConfigured()) return null;
  try {
    const rows = await readTab("Products");
    const hit = rows.find((r) => Number(r.id) === id);
    const raw = (hit?.image ?? "").trim();
    const m = raw.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    return m ? { type: m[1], base64: m[2] } : null;
  } catch {
    return null;
  }
}

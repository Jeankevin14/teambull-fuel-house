// Where the website gets its products from: your Google Sheet (tab "Products").
// If the sheet is not set up or is empty, it uses src/data/products.ts instead,
// so the shop never shows an empty page.
import { connection } from "next/server";
import { cacheLife, cacheTag } from "next/cache";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types";
import { readTab, sheetsConfigured } from "@/lib/sheets";
import {
  isDataImage,
  rowToProduct,
  type SheetProduct,
} from "@/lib/productRows";

/** a product is shown in the shop only once it has a price */
const priced = (p: Product) => p.price > 0 || (p.sizes?.some((x) => x.price > 0) ?? false);

/** Public product list (cached ~1 minute; admin changes refresh it straight away). */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag("products");

  if (!sheetsConfigured()) return PRODUCTS.filter(priced);
  try {
    const rows = await readTab("Products");
    if (rows.length === 0) return PRODUCTS.filter(priced);
    const list = rows
      .map((r) => rowToProduct(r))
      .filter((p): p is SheetProduct => p !== null && p.active && priced(p))
      .map((p): Product => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { active, ...product } = p;
        return product;
      });
    // old sample rows (brand "Brand Name") are placeholders: show the built-in list instead
    if (list.length > 0 && list.every((p) => p.brand === "Brand Name")) {
      return PRODUCTS.filter(priced);
    }
    return list;
  } catch (e) {
    console.error(
      "[catalog] could not read Google Sheet, using built-in products:",
      e,
    );
    return PRODUCTS.filter(priced);
  }
}

/**
 * One product by id. Uses the cached list first; if the product is not in it yet
 * (for example it was added a few seconds ago), asks the sheet directly.
 */
export async function findProduct(id: number): Promise<Product | undefined> {
  const hit = (await getProducts()).find((p) => p.id === id);
  if (hit || !sheetsConfigured()) return hit;
  await connection(); // fresh lookup: must happen at request time, not at build time
  try {
    const rows = await readTab("Products");
    const row = rows.find((r) => Number(r.id) === id);
    const p = row ? rowToProduct(row) : null;
    if (!p || !p.active || !priced(p)) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { active, ...product } = p;
    return product;
  } catch {
    return undefined;
  }
}

export type AdminProduct = SheetProduct & { row: number };

/** Admin view: every product (also hidden ones), never cached. */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  const rows = await readTab("Products");
  return rows
    .map((r) => {
      const p = rowToProduct(r);
      return p ? { ...p, row: r._row } : null;
    })
    .filter((p): p is AdminProduct => p !== null);
}

/** The uploaded photo of one product (cached; refreshed whenever Admin saves). */
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
    if (!isDataImage(raw)) return null;
    const m = raw.match(
      /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/,
    );
    return m ? { type: m[1], base64: m[2] } : null;
  } catch {
    return null;
  }
}

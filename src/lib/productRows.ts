// Turns Google Sheet rows into Products (and back). Pure functions, no network.
import { CATEGORIES } from "@/config/site";
import type { Category } from "@/config/site";
import type { Product, ProductSize } from "@/types";

export type SheetProduct = Product & { active: boolean };

function num(v: string | undefined): number | undefined {
  const t = (v ?? "").replace(/[₹,\s]/g, "");
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/** "1kg:1999|2kg:3499"  ->  [{label:"1kg",price:1999},{label:"2kg",price:3499}] */
export function parseSizes(text: string | undefined): ProductSize[] | undefined {
  const list = (text ?? "")
    .split("|")
    .map((part) => {
      const i = part.lastIndexOf(":");
      if (i < 0) return null;
      const label = part.slice(0, i).trim();
      const price = num(part.slice(i + 1));
      return label && price !== undefined ? { label, price } : null;
    })
    .filter((x): x is ProductSize => x !== null);
  return list.length ? list : undefined;
}

export function sizesToText(sizes?: ProductSize[]) {
  return (sizes ?? []).map((s) => `${s.label}:${s.price}`).join("|");
}

export function parseList(text: string | undefined): string[] | undefined {
  const list = (text ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : undefined;
}

/** Photos uploaded in Admin are stored in the sheet as a small data URL. */
export function isDataImage(v: string | undefined) {
  return (v ?? "").startsWith("data:image/");
}

function checksum(text: string) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function rowToProduct(r: Record<string, string>): SheetProduct | null {
  const id = num(r.id);
  const name = (r.name ?? "").trim();
  if (id === undefined || !name) return null;

  const sizes = parseSizes(r.sizes);
  const price = num(r.price) ?? sizes?.[0]?.price ?? 0;
  const stock = num(r.stock);
  const category = ((r.category ?? "").trim() || CATEGORIES[0]) as Category;
  const rawImage = (r.image ?? "").trim();
  // uploaded photos are served from /product-image/<id> so the pages stay small
  const image = isDataImage(rawImage)
    ? `/product-image/${id}?v=${checksum(rawImage)}`
    : rawImage || undefined;

  return {
    id,
    name,
    brand: (r.brand ?? "").trim(),
    category,
    price,
    description: (r.description ?? "").trim(),
    image,
    flavours: parseList(r.flavours),
    sizes,
    stock: stock === undefined ? undefined : Math.max(0, Math.floor(stock)),
    inStock: stock === undefined ? true : stock > 0,
    active: (r.active ?? "").trim().toUpperCase() !== "FALSE",
  };
}

export function productToRow(p: {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  flavours?: string[];
  sizes?: ProductSize[];
  stock?: number;
  active: boolean;
}) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    description: p.description,
    image: p.image ?? "",
    flavours: (p.flavours ?? []).join(", "),
    sizes: sizesToText(p.sizes),
    stock: p.stock === undefined ? "" : p.stock,
    active: p.active ? "TRUE" : "FALSE",
  };
}

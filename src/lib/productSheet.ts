// Shared helpers for changing product rows in the Google Sheet.
// Server-side only (it talks to sheets.ts).
import { PRODUCTS } from "@/data/products";
import { productToRow, rowToProduct } from "@/lib/productRows";
import { appendRow, readTab, updateRow, type Row } from "@/lib/sheets";

/**
 * Finds the sheet row for a product, creating one from the catalogue if this is the
 * first time anyone has edited it. That is what lets stock be changed straight away
 * on a product that has only ever existed in the code.
 */
export async function rowFor(id: number): Promise<Row | null> {
  const rows = await readTab("Products");
  const hit = rows.find((r) => rowToProduct(r)?.id === id);
  if (hit) return hit;
  const base = PRODUCTS.find((p) => p.id === id);
  if (!base) return null;
  await appendRow("Products", productToRow({ ...base, stock: base.stock ?? 0, active: true }));
  const after = await readTab("Products");
  return after.find((r) => rowToProduct(r)?.id === id) ?? null;
}

/**
 * Takes sold units off the stock count, reading the sheet once for the whole bill.
 * Products with no stock number are left alone (their stock is not tracked).
 * Stock never goes below zero.
 */
export async function reduceStock(sold: { id: number; qty: number }[]): Promise<void> {
  if (sold.length === 0) return;

  // Add any product that has never been edited, so it has a row to update.
  for (const s of sold) await rowFor(s.id);

  const rows = await readTab("Products");
  const wanted = new Map<number, number>();
  for (const s of sold) wanted.set(s.id, (wanted.get(s.id) ?? 0) + s.qty);

  for (const [id, qty] of wanted) {
    const hit = rows.find((r) => rowToProduct(r)?.id === id);
    const product = hit ? rowToProduct(hit) : null;
    if (!hit || !product || product.stock === undefined) continue;
    const next = Math.max(0, product.stock - qty);
    await updateRow("Products", hit._row, { ...hit, stock: next });
  }
}

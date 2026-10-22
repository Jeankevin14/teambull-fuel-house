"use server";

import { updateTag } from "next/cache";
import { CATEGORIES } from "@/config/site";
import { PRODUCTS } from "@/data/products";
import { assertAdmin } from "@/lib/session";
import { appendRow, appendRows, readTab, updateRow } from "@/lib/sheets";
import { isDataImage, parseList, parseSizes, productToRow, rowToProduct } from "@/lib/productRows";
import { ORDER_STATUSES, setOrderStatus } from "@/lib/orders";
import { text } from "@/lib/validate";
import type { FormState } from "@/types/forms";

function num(v: FormDataEntryValue | null) {
  const t = String(v ?? "").replace(/[₹,\s]/g, "");
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

/** Add a new product (no id) or update an existing one (has id). */
export async function saveProductAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await assertAdmin();

  const name = text(fd.get("name"), 100);
  const brand = text(fd.get("brand"), 60);
  const category = text(fd.get("category"), 40);
  const description = text(fd.get("description"), 400);
  const imageRaw = String(fd.get("image") ?? "").trim();
  const keepImage = imageRaw.startsWith("/product-image/"); // unchanged uploaded photo
  let image = keepImage ? "" : imageRaw.slice(0, 300);
  if (isDataImage(imageRaw)) {
    const ok = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(imageRaw) && imageRaw.length <= 48000;
    if (!ok) return { ok: false, error: "That photo is too big or not a normal picture. Try a smaller one." };
    image = imageRaw;
  } else if (image && !image.startsWith("/") && !/^https?:\/\//.test(image)) {
    return { ok: false, error: "Photo link must start with / or https://" };
  }
  const flavours = parseList(text(fd.get("flavours"), 300));
  const sizes = parseSizes(text(fd.get("sizes"), 300));
  const price = num(fd.get("price")) ?? sizes?.[0]?.price;
  const stockRaw = num(fd.get("stock"));
  const stock = stockRaw === undefined ? undefined : Math.max(0, Math.floor(stockRaw));
  const active = fd.get("active") === "on";
  const idRaw = num(fd.get("id"));

  if (!name) return { ok: false, error: "Product name is required." };
  if (!(CATEGORIES as readonly string[]).includes(category)) return { ok: false, error: "Choose a category." };
  if (price === undefined || price < 0) return { ok: false, error: "Enter a price (numbers only)." };
  if (String(fd.get("sizes") ?? "").trim() && !sizes) {
    return { ok: false, error: 'Sizes must look like  1kg:1999|2kg:3499' };
  }

  try {
    const rows = await readTab("Products");
    if (idRaw !== undefined) {
      const hit = rows.find((r) => rowToProduct(r)?.id === idRaw);
      if (!hit) return { ok: false, error: "Product not found. Refresh the page." };
      const finalImage = keepImage ? (hit.image ?? "") : image;
      await updateRow("Products", hit._row, productToRow({ id: idRaw, name, brand, category, price, description, image: finalImage || undefined, flavours, sizes, stock, active }));
      updateTag("products");
      return { ok: true, id: idRaw, message: "Saved." };
    }
    const maxId = rows.reduce((m, r) => Math.max(m, rowToProduct(r)?.id ?? 0), 0);
    await appendRow("Products", productToRow({ id: maxId + 1, name, brand, category, price, description, image: image || undefined, flavours, sizes, stock, active }));
    updateTag("products");
    return { ok: true, id: maxId + 1, message: `Added "${name}".` };
  } catch (e) {
    console.error("[admin save]", e);
    return { ok: false, error: "Could not save to Google Sheets. Check the setup and try again." };
  }
}

/** + / - buttons next to the stock number. */
export async function adjustStockAction(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = num(fd.get("id"));
  const delta = num(fd.get("delta"));
  if (id === undefined || delta === undefined) return;

  const rows = await readTab("Products");
  const hit = rows.find((r) => rowToProduct(r)?.id === id);
  const product = hit ? rowToProduct(hit) : null;
  if (!hit || !product) return;

  const next = Math.max(0, (product.stock ?? 0) + Math.trunc(delta));
  await updateRow("Products", hit._row, { ...hit, stock: next });
  updateTag("products");
}

/** Hide / show a product on the website. */
export async function toggleActiveAction(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = num(fd.get("id"));
  if (id === undefined) return;

  const rows = await readTab("Products");
  const hit = rows.find((r) => rowToProduct(r)?.id === id);
  const product = hit ? rowToProduct(hit) : null;
  if (!hit || !product) return;

  await updateRow("Products", hit._row, { ...hit, active: product.active ? "FALSE" : "TRUE" });
  updateTag("products");
}

/** One click: copy the sample products into the sheet (only if it has none yet). */
export async function importSamplesAction(): Promise<void> {
  await assertAdmin();
  const rows = await readTab("Products");
  if (rows.length > 0) return;
  await appendRows(
    "Products",
    PRODUCTS.map((p) =>
      productToRow({ ...p, stock: p.stock ?? 20, active: true })
    )
  );
  updateTag("products");
}

/**
 * Replace every product in the sheet with the list in src/data/products.ts.
 * Old rows are reused, extra old rows are blanked (the shop ignores blank rows), the rest are added.
 * Prices start empty: a product stays hidden in the shop until you set its price.
 */
export async function replaceProductsAction(): Promise<void> {
  await assertAdmin();
  const rows = await readTab("Products");
  const fresh = PRODUCTS.map((p) => productToRow({ ...p, price: p.price > 0 ? p.price : 0, stock: p.stock ?? 0, active: true }));
  const blank = { id: "", name: "", brand: "", category: "", price: "", description: "", image: "", flavours: "", sizes: "", stock: "", active: "" };
  for (let i = 0; i < rows.length; i++) {
    await updateRow("Products", rows[i]._row, i < fresh.length ? fresh[i] : blank);
  }
  await appendRows("Products", fresh.slice(rows.length));
  updateTag("products");
}

export async function orderStatusAction(fd: FormData): Promise<void> {
  await assertAdmin();
  const orderId = text(fd.get("orderId"), 40);
  const status = text(fd.get("status"), 20);
  if (!orderId || !(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await setOrderStatus(orderId, status);
}

"use server";

import { updateTag } from "next/cache";
import { BILLING, gstEnabled } from "@/config/billing";
import {
  addBill, cancelBill, getAllBills, linesOf, nextBillNo, type BillLine,
} from "@/lib/bills";
import { getAdminProducts } from "@/lib/catalog";
import { reduceStock, restoreStock } from "@/lib/productSheet";
import { assertAdmin } from "@/lib/session";
import { cleanPhone, text } from "@/lib/validate";

export type BillFormState = {
  ok: boolean;
  error?: string;
  billNo?: string;
  total?: number;
};

export type CancelState = {
  ok: boolean;
  error?: string;
  message?: string;
};

/**
 * Cancels a bill: it stops counting towards sales, and the units go back on
 * the shelf unless the counter says the customer kept them.
 *
 * The bill itself is kept rather than erased. That way its number can never be
 * handed to a different sale, and there is a record that this one was called off.
 */
export async function cancelBillAction(
  _prev: CancelState,
  fd: FormData
): Promise<CancelState> {
  const me = await assertAdmin();

  const billNo = text(fd.get("billNo"), 40);
  if (!billNo) return { ok: false, error: "Which bill? Reload the page and try again." };
  const reason = text(fd.get("reason"), 120);
  const putBack = String(fd.get("restock") ?? "") === "yes";

  try {
    const result = await cancelBill(billNo, me.name || me.email, reason);
    if (!result.ok) {
      return {
        ok: false,
        error:
          result.reason === "already"
            ? "That bill was already cancelled."
            : "That bill no longer exists. Reload the page.",
      };
    }

    const lines = linesOf(result.bill);
    let note = "";
    if (putBack && lines.length > 0) {
      try {
        await restoreStock(lines.map((l) => ({ id: l.id, qty: l.qty })));
      } catch (e) {
        console.error("[billing] stock not restored", e);
        note = " Stock could not be put back — check the stock numbers.";
      }
    }
    updateTag("products");

    return {
      ok: true,
      message:
        `Bill ${billNo} cancelled. It no longer counts towards your sales.` +
        (putBack && lines.length > 0 && !note ? " The items are back in stock." : "") +
        note,
    };
  } catch (e) {
    console.error("[billing] cancel failed", e);
    return { ok: false, error: "Could not cancel that bill. Try again." };
  }
}

const MAX_LINES = 50;
const MAX_QTY = 999;
const MAX_PRICE = 1_000_000;

/** Rupees, rounded to paise so totals always add up. */
function r2(n: number) {
  return Math.round(n * 100) / 100;
}

type RawLine = { id: number; qty: number; price: number; variant?: string };

function parseLines(raw: string): RawLine[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > MAX_LINES) return null;

  const out: RawLine[] = [];
  for (const item of parsed) {
    if (typeof item !== "object" || item === null) return null;
    const l = item as Record<string, unknown>;
    const id = Number(l.id);
    const qty = Number(l.qty);
    const price = Number(l.price);
    if (!Number.isInteger(id) || id <= 0) return null;
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return null;
    if (!Number.isFinite(price) || price < 0 || price > MAX_PRICE) return null;
    out.push({
      id,
      qty,
      price: r2(price),
      variant: l.variant ? String(l.variant).slice(0, 60) : undefined,
    });
  }
  return out;
}

/**
 * Saves a bill and takes the sold units off stock.
 * Product names come from the catalogue, never from the browser.
 */
export async function createBillAction(
  _prev: BillFormState,
  fd: FormData
): Promise<BillFormState> {
  const me = await assertAdmin();

  const lines = parseLines(String(fd.get("lines") ?? ""));
  if (!lines) return { ok: false, error: "Add at least one product to the bill." };

  const customerName = text(fd.get("customerName"), 80);
  const phoneTyped = String(fd.get("customerPhone") ?? "").trim();
  const customerPhone = phoneTyped ? cleanPhone(phoneTyped) : "";
  if (customerPhone === null) {
    return {
      ok: false,
      error: "That phone number does not look right. Use 10 digits, or leave it blank.",
    };
  }

  const payment = text(fd.get("payment"), 20) || "Cash";
  if (!(BILLING.paymentMethods as readonly string[]).includes(payment)) {
    return { ok: false, error: "Choose how the customer paid." };
  }

  const percentRaw = Number(String(fd.get("discountPercent") ?? "0").replace(/[%\s]/g, ""));
  if (percentRaw < 0 || percentRaw > 100 || !Number.isFinite(percentRaw)) {
    return { ok: false, error: "The discount must be between 0 and 100 percent." };
  }
  const discountPercent = r2(percentRaw);

  // Delivery is a flat charge in rupees, typed at the counter.
  const deliveryRaw = Number(String(fd.get("delivery") ?? "0").replace(/[₹,\s]/g, "") || "0");
  if (!Number.isFinite(deliveryRaw) || deliveryRaw < 0 || deliveryRaw > BILLING.maxDelivery) {
    return {
      ok: false,
      error: `The delivery charge must be between ₹0 and ₹${BILLING.maxDelivery.toLocaleString("en-IN")}.`,
    };
  }
  const delivery = Math.round(deliveryRaw);

  try {
    const products = await getAdminProducts();
    const byId = new Map(products.map((p) => [p.id, p]));

    const billLines: BillLine[] = [];
    for (const l of lines) {
      const product = byId.get(l.id);
      if (!product) {
        return { ok: false, error: "One of those products no longer exists. Reload the page." };
      }
      billLines.push({
        id: product.id,
        name: product.name,
        variant: l.variant,
        qty: l.qty,
        price: l.price,
        // the MRP comes from the catalogue, and only when it beats what we charged
        mrp: product.mrp && product.mrp > l.price ? product.mrp : undefined,
      });
    }

    const subtotal = r2(billLines.reduce((s, l) => s + l.price * l.qty, 0));
    // Whole rupees: a shop counter does not hand back paise.
    const discount = Math.round((subtotal * discountPercent) / 100);
    const taxable = r2(subtotal - discount);
    const tax = gstEnabled() ? Math.round((taxable * BILLING.taxPercent) / 100) : 0;
    // Delivery goes on last, so a discount percent never eats into it and the
    // GST figure stays a tax on the goods alone.
    const total = r2(taxable + tax + delivery);

    const billNo = nextBillNo(await getAllBills());

    await addBill({
      billNo,
      customerName,
      customerPhone,
      lines: billLines,
      subtotal,
      discount,
      discountPercent,
      tax,
      delivery,
      total,
      payment,
      createdBy: me.name || me.email,
    });

    // Sold units come off stock. A bill is still valid if this part fails,
    // so the number is reported either way.
    try {
      await reduceStock(billLines.map((l) => ({ id: l.id, qty: l.qty })));
      updateTag("products");
    } catch (e) {
      console.error("[billing] stock not reduced", e);
      return {
        ok: true,
        billNo,
        total,
        error: "Bill saved, but stock could not be updated. Check the stock numbers.",
      };
    }

    return { ok: true, billNo, total };
  } catch (e) {
    console.error("[billing]", e);
    return { ok: false, error: "Could not save the bill. Check the Google Sheet setup and try again." };
  }
}

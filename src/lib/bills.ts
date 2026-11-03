// Bills, stored in the "Bills" tab of your Google Sheet.
import { BILLING } from "@/config/billing";
import { appendRow, readTab, syncHeaders, updateRow } from "@/lib/sheets";

export type BillLine = {
  id: number;
  name: string;
  variant?: string;
  qty: number;
  price: number; // unit price actually charged
  mrp?: number; // the pack MRP, when it is above what we charged
};

export type BillRecord = {
  row: number;
  billNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: string; // human-readable, so the Sheet stays readable
  itemsJson: string; // exact lines, used to reprint the bill
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  /** Delivery charge, added on top of the goods. 0 on a counter sale. */
  delivery: number;
  total: number;
  payment: string;
  createdBy: string;
  /**
   * "" or "ok" for a live bill, "cancelled" for one that was called off.
   * A cancelled bill is kept, never erased: the row holds the bill number so
   * it can never be handed to a different sale, and the shop keeps a record
   * of what happened.
   */
  status: string;
  cancelledAt: string;
  cancelledBy: string;
  cancelReason: string;
};

/** A bill that still counts towards sales and stock. */
export function isLive(b: BillRecord) {
  return b.status !== "cancelled";
}

function money(v: string | number | undefined) {
  const n = Number(String(v ?? "").replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toBill(r: Record<string, string> & { _row: number }): BillRecord {
  return {
    row: r._row,
    billNo: r.billNo ?? "",
    date: r.date ?? "",
    customerName: r.customerName ?? "",
    customerPhone: r.customerPhone ?? "",
    items: r.items ?? "",
    itemsJson: r.itemsJson ?? "",
    subtotal: money(r.subtotal),
    discount: money(r.discount),
    discountPercent: money(r.discountPercent),
    tax: money(r.tax),
    // Bills saved before delivery existed simply have no value here.
    delivery: money(r.delivery),
    total: money(r.total),
    payment: r.payment || "Cash",
    createdBy: r.createdBy ?? "",
    // bills saved before cancelling existed simply have no status
    status: (r.status ?? "").trim().toLowerCase(),
    cancelledAt: r.cancelledAt ?? "",
    cancelledBy: r.cancelledBy ?? "",
    cancelReason: r.cancelReason ?? "",
  };
}

/** Indian financial year for a date: 1 April to 31 March. "2026-27" */
export function financialYear(d: Date) {
  const y = d.getFullYear();
  const start = d.getMonth() >= 3 ? y : y - 1; // month 3 = April
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

/**
 * Next bill number for this financial year: TFH-2026-27-001.
 * Numbers never go backwards — we take the highest one already used this year.
 */
export function nextBillNo(existing: BillRecord[], now = new Date()) {
  const fy = financialYear(now);
  const head = `${BILLING.prefix}-${fy}-`;
  let max = 0;
  for (const b of existing) {
    if (!b.billNo.startsWith(head)) continue;
    const n = Number(b.billNo.slice(head.length));
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${head}${String(max + 1).padStart(3, "0")}`;
}

export function linesText(lines: BillLine[]) {
  return lines
    .map(
      (l, i) =>
        `${i + 1}. ${l.name}${l.variant ? ` (${l.variant})` : ""} x ${l.qty} = ₹${(
          l.price * l.qty
        ).toLocaleString("en-IN")}`
    )
    .join("\n");
}

/** Reads the lines back off a saved bill. Never throws on bad data. */
export function linesOf(bill: BillRecord): BillLine[] {
  try {
    const parsed: unknown = JSON.parse(bill.itemsJson || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((raw) => {
      if (typeof raw !== "object" || raw === null) return [];
      const l = raw as Record<string, unknown>;
      const qty = Number(l.qty);
      const price = Number(l.price);
      if (!Number.isFinite(qty) || !Number.isFinite(price)) return [];
      const mrp = Number(l.mrp);
      return [
        {
          id: Number(l.id) || 0,
          name: String(l.name ?? ""),
          variant: l.variant ? String(l.variant) : undefined,
          qty,
          price,
          mrp: Number.isFinite(mrp) && mrp > price ? mrp : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function getAllBills(): Promise<BillRecord[]> {
  const rows = await readTab("Bills");
  return rows.map(toBill).reverse(); // newest first
}

export async function getBill(billNo: string): Promise<BillRecord | undefined> {
  const rows = await readTab("Bills");
  return rows.map(toBill).find((b) => b.billNo === billNo);
}

export async function addBill(b: {
  billNo: string;
  customerName: string;
  customerPhone: string;
  lines: BillLine[];
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  delivery: number;
  total: number;
  payment: string;
  createdBy: string;
}) {
  await appendRow("Bills", {
    billNo: b.billNo,
    date: new Date().toISOString(),
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    items: linesText(b.lines),
    itemsJson: JSON.stringify(b.lines),
    subtotal: b.subtotal,
    discount: b.discount,
    discountPercent: b.discountPercent,
    tax: b.tax,
    delivery: b.delivery,
    total: b.total,
    payment: b.payment,
    createdBy: b.createdBy,
    status: "ok",
    cancelledAt: "",
    cancelledBy: "",
    cancelReason: "",
  });
  return b.billNo;
}

export type CancelResult =
  | { ok: true; bill: BillRecord }
  | { ok: false; reason: "missing" | "already" | "no-column" | "not-saved" };

/**
 * Marks a bill cancelled, in place. The row is never removed: keeping it means
 * the bill number can never be reused for a different sale, and there is still
 * a record that the sale was called off.
 *
 * Returns "already" if it was cancelled before, which is what stops the stock
 * being put back twice.
 */
export async function cancelBill(
  billNo: string,
  by: string,
  reason: string
): Promise<CancelResult> {
  let rows = await readTab("Bills");
  let raw = rows.find((r) => (r.billNo ?? "") === billNo);
  if (!raw) return { ok: false, reason: "missing" };

  // A sheet made before cancelling existed has no "status" column, and a write
  // to a column that is not there is silently thrown away — the bill would look
  // cancelled and the totals would not move. Add the column, then carry on.
  if (!("status" in raw)) {
    await syncHeaders("Bills");
    rows = await readTab("Bills");
    raw = rows.find((r) => (r.billNo ?? "") === billNo);
    if (!raw) return { ok: false, reason: "missing" };
    if (!("status" in raw)) return { ok: false, reason: "no-column" };
  }

  const before = toBill(raw);
  if (!isLive(before)) return { ok: false, reason: "already" };

  await updateRow("Bills", raw._row, {
    ...raw,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
    cancelledBy: by,
    cancelReason: reason,
  });

  // Read it back. A write the sheet quietly refused would otherwise look like
  // a success while the sales figures never moved — which is exactly the kind
  // of failure a shop must never be left guessing about.
  const after = (await readTab("Bills")).find((r) => (r.billNo ?? "") === billNo);
  if (!after || toBill(after).status !== "cancelled") {
    return { ok: false, reason: "not-saved" };
  }
  return { ok: true, bill: before };
}

/** What the customer saved against MRP on a bill. 0 when no line had an MRP. */
export function savedOn(lines: BillLine[]) {
  return lines.reduce(
    (sum, l) => (l.mrp && l.mrp > l.price ? sum + (l.mrp - l.price) * l.qty : sum),
    0
  );
}

/**
 * Sales totals for the admin tiles.
 * Cancelled bills are left out, so the figures always tally with the money
 * actually taken.
 */
export function salesSince(bills: BillRecord[], from: Date) {
  const cut = from.getTime();
  let sum = 0;
  let count = 0;
  for (const b of bills) {
    if (!isLive(b)) continue;
    const t = Date.parse(b.date);
    if (Number.isFinite(t) && t >= cut) {
      sum += b.total;
      count += 1;
    }
  }
  return { sum, count };
}

export function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function startOfMonth(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

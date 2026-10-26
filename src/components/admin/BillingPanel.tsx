"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { BILLING, gstEnabled } from "@/config/billing";
import { createBillAction, type BillFormState } from "@/app/actions/billing";
import { formatPrice } from "@/lib/format";

export type BillableProduct = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  flavours?: string[];
  sizes?: { label: string; price: number }[];
};

type Line = {
  key: string;
  id: number;
  name: string;
  variant: string;
  qty: number;
  price: number;
};

const field =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-foreground outline-none focus:border-accent";
const smallBtn =
  "rounded-md border border-line bg-white px-2.5 py-1 text-sm font-semibold text-foreground hover:border-accent hover:text-accent";

export default function BillingPanel({ products }: { products: BillableProduct[] }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState("");
  const [pick, setPick] = useState("");
  const [state, formAction, pending] = useActionState<BillFormState, FormData>(
    createBillAction,
    { ok: false }
  );

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  /**
   * What goes in the small dropdown next to a line. Sizes win, because they change
   * the price. A single flavour is left off: the product name already says it.
   */
  function optionsFor(product: BillableProduct): string[] {
    if (product.sizes?.length) return product.sizes.map((s) => s.label);
    const flavours = product.flavours ?? [];
    return flavours.length > 1 ? flavours : [];
  }

  function addProduct(idText: string) {
    const product = byId.get(Number(idText));
    if (!product) return;
    const firstSize = product.sizes?.[0];
    setLines((prev) => [
      ...prev,
      {
        key: `${product.id}-${Date.now()}`,
        id: product.id,
        name: product.name,
        variant: optionsFor(product)[0] ?? "",
        qty: 1,
        price: firstSize?.price ?? product.price,
      },
    ]);
    setPick("");
  }

  function update(key: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function variantChanged(line: Line, value: string) {
    const size = byId.get(line.id)?.sizes?.find((s) => s.label === value);
    update(line.key, size ? { variant: value, price: size.price } : { variant: value });
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const off = Math.min(Math.max(Number(discount.replace(/[₹,\s]/g, "")) || 0, 0), subtotal);
  const taxable = subtotal - off;
  const tax = gstEnabled() ? Math.round(((taxable * BILLING.taxPercent) / 100) * 100) / 100 : 0;
  const total = taxable + tax;

  // After a save, start the next bill from a clean slate.
  const justSaved = state.ok && state.billNo;

  return (
    <div className="mt-4 rounded-xl border border-line bg-surface p-5">
      {justSaved && (
        <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-semibold">
            ✓ Bill {state.billNo} saved{state.total !== undefined ? ` · ${formatPrice(state.total)}` : ""}
          </p>
          {state.error && <p className="mt-1 text-amber-700">{state.error}</p>}
          <p className="mt-2 flex flex-wrap gap-3">
            <Link
              href={`/admin/bills/${state.billNo}`}
              className="font-semibold text-accent underline"
            >
              Open and print the bill
            </Link>
            <button
              type="button"
              onClick={() => {
                setLines([]);
                setDiscount("");
              }}
              className="font-semibold text-accent underline"
            >
              Start the next bill
            </button>
          </p>
        </div>
      )}

      {state.error && !state.ok && (
        <p className="mb-4 rounded-lg bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-dark">
          {state.error}
        </p>
      )}

      <form action={formAction}>
        <input type="hidden" name="lines" value={JSON.stringify(
          lines.map((l) => ({ id: l.id, qty: l.qty, price: l.price, variant: l.variant || undefined }))
        )} />

        <label className="block text-sm font-semibold text-foreground">
          Add a product
          <select
            className={`${field} mt-1`}
            value={pick}
            onChange={(e) => addProduct(e.target.value)}
          >
            <option value="">Choose a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatPrice(p.price)}
                {p.stock !== undefined ? ` (${p.stock} left)` : ""}
              </option>
            ))}
          </select>
        </label>

        {lines.length === 0 ? (
          <p className="mt-4 text-muted">
            No items yet. Pick a product above to start the bill.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-white">
            {lines.map((l) => {
              const product = byId.get(l.id);
              const options = product ? optionsFor(product) : [];
              const short = product?.stock;
              return (
                <div key={l.key} className="flex flex-wrap items-end gap-3 p-3">
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="font-semibold text-foreground">{l.name}</p>
                    {options.length > 0 && (
                      <select
                        className="mt-1 w-full rounded-md border border-line bg-white px-2 py-1 text-sm"
                        value={l.variant}
                        onChange={(e) => variantChanged(l, e.target.value)}
                      >
                        {options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    )}
                    {short !== undefined && l.qty > short && (
                      <p className="mt-1 text-xs font-semibold text-accent">
                        Only {short} in stock
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="block text-xs text-muted">Qty</span>
                    <div className="mt-1 flex items-center gap-1">
                      <button
                        type="button"
                        className={smallBtn}
                        onClick={() => update(l.key, { qty: Math.max(1, l.qty - 1) })}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{l.qty}</span>
                      <button
                        type="button"
                        className={smallBtn}
                        onClick={() => update(l.key, { qty: Math.min(999, l.qty + 1) })}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <label className="text-xs text-muted">
                    Price each
                    <input
                      inputMode="decimal"
                      className="mt-1 w-24 rounded-md border border-line bg-white px-2 py-1 text-sm text-foreground"
                      value={l.price}
                      onChange={(e) =>
                        update(l.key, { price: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })
                      }
                    />
                  </label>

                  <p className="w-24 text-right font-semibold">
                    {formatPrice(l.price * l.qty)}
                  </p>

                  <button
                    type="button"
                    className={smallBtn}
                    onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-foreground">
            Customer name <span className="font-normal text-muted">(optional)</span>
            <input name="customerName" className={`${field} mt-1`} maxLength={80} />
          </label>
          <label className="block text-sm font-semibold text-foreground">
            Phone <span className="font-normal text-muted">(optional)</span>
            <input name="customerPhone" className={`${field} mt-1`} inputMode="tel" maxLength={20} />
          </label>
          <label className="block text-sm font-semibold text-foreground">
            Discount
            <input
              name="discount"
              className={`${field} mt-1`}
              inputMode="decimal"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="block text-sm font-semibold text-foreground">
            Paid by
            <select name="payment" className={`${field} mt-1`} defaultValue="Cash">
              {BILLING.paymentMethods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
          <dl className="text-sm">
            <div className="flex gap-3">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            {off > 0 && (
              <div className="flex gap-3">
                <dt className="text-muted">Discount</dt>
                <dd className="font-semibold">− {formatPrice(off)}</dd>
              </div>
            )}
            {gstEnabled() && (
              <div className="flex gap-3">
                <dt className="text-muted">GST {BILLING.taxPercent}%</dt>
                <dd className="font-semibold">{formatPrice(tax)}</dd>
              </div>
            )}
            <div className="mt-1 flex gap-3 font-display text-2xl font-bold">
              <dt>Total</dt>
              <dd className="text-accent">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            disabled={pending || lines.length === 0}
            className="rounded-lg bg-accent px-6 py-3 font-display text-lg font-bold uppercase text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save bill"}
          </button>
        </div>
      </form>
    </div>
  );
}

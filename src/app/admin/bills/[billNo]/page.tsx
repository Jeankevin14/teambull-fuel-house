import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BarbellLoader from "@/components/fx/BarbellLoader";
import PrintButton from "@/components/admin/PrintButton";
import BillPdfButton from "@/components/admin/BillPdfButton";
import { BILLING, gstEnabled } from "@/config/billing";
import { SITE } from "@/config/site";
import { getBill, linesOf, savedOn } from "@/lib/bills";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Bill",
  robots: { index: false },
};

function billDate(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 10 digits means an Indian mobile, so add the country code for the wa.me link. */
function waNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `91${d}`;
  return d.length >= 11 ? d : "";
}

export default function BillPage({
  params,
}: {
  params: Promise<{ billNo: string }>;
}) {
  return (
    <Suspense fallback={<BarbellLoader />}>
      <Bill params={params} />
    </Suspense>
  );
}

async function Bill({ params }: { params: Promise<{ billNo: string }> }) {
  await requireAdmin();
  const { billNo } = await params;
  const bill = await getBill(decodeURIComponent(billNo));
  if (!bill) notFound();

  const lines = linesOf(bill);
  const saved = savedOn(lines);
  const wa = waNumber(bill.customerPhone);
  const waText = [
    `${SITE.name}`,
    `Bill ${bill.billNo} · ${billDate(bill.date)}`,
    "",
    ...lines.map(
      (l, i) =>
        `${i + 1}. ${l.name}${l.variant ? ` (${l.variant})` : ""} x ${l.qty} = ${formatPrice(l.price * l.qty)}`
    ),
    "",
    ...(bill.discount > 0
      ? [
          `Discount${bill.discountPercent > 0 ? ` (${bill.discountPercent}%)` : ""}: -${formatPrice(bill.discount)}`,
        ]
      : []),
    ...(bill.delivery > 0 ? [`Delivery: +${formatPrice(bill.delivery)}`] : []),
    `Total: ${formatPrice(bill.total)}`,
    `Paid by: ${bill.payment}`,
    ...(saved > 0 ? [`You saved ${formatPrice(saved)} against MRP`] : []),
    "",
    "Thank you!",
  ].join("\n");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <Link href="/admin" className="text-sm font-semibold text-accent underline">
          ← Back to admin
        </Link>
        <span className="flex-1" />
        {wa && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent"
          >
            Send on WhatsApp
          </a>
        )}
        <BillPdfButton
          bill={{
            billNo: bill.billNo,
            dateText: billDate(bill.date),
            title: gstEnabled() ? "Tax Invoice" : "Bill",
            shopName: SITE.name,
            shopAddress: SITE.address,
            shopPhone: SITE.whatsapp,
            gstin: gstEnabled() ? BILLING.gstin : undefined,
            fssai: SITE.fssai || undefined,
            customerName: bill.customerName,
            customerPhone: bill.customerPhone,
            lines: lines.map((l) => ({
              name: l.name,
              variant: l.variant,
              qty: l.qty,
              price: l.price,
              mrp: l.mrp,
            })),
            saved,
            subtotal: bill.subtotal,
            discount: bill.discount,
            discountPercent: bill.discountPercent,
            taxLabel: `GST ${BILLING.taxPercent}%`,
            tax: bill.tax,
            delivery: bill.delivery,
            total: bill.total,
            payment: bill.payment,
            footerNote: BILLING.footerNote,
            billedBy: bill.createdBy,
          }}
        />
        <PrintButton />
      </div>

      <article className="bill-sheet rounded-xl border border-line bg-white p-6 print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start gap-4 border-b border-line pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/teambull-logo.png"
            alt=""
            width={72}
            height={72}
            className="h-16 w-auto flex-none object-contain"
          />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold uppercase">{SITE.name}</h1>
            <p className="mt-1 text-sm text-muted">{SITE.address}</p>
            <p className="text-sm text-muted">
              WhatsApp +{SITE.whatsapp}
              {SITE.fssai ? ` · FSSAI ${SITE.fssai}` : ""}
            </p>
            {gstEnabled() && (
              <p className="text-sm text-muted">GSTIN {BILLING.gstin}</p>
            )}
          </div>
        </header>

        <div className="mt-4 flex flex-wrap justify-between gap-4 text-sm">
          <div>
            <p className="font-semibold text-foreground">
              {gstEnabled() ? "Tax Invoice" : "Bill"} {bill.billNo}
            </p>
            <p className="text-muted">{billDate(bill.date)}</p>
          </div>
          {(bill.customerName || bill.customerPhone) && (
            <div className="text-right">
              <p className="font-semibold text-foreground">
                {bill.customerName || "Customer"}
              </p>
              {bill.customerPhone && <p className="text-muted">{bill.customerPhone}</p>}
            </div>
          )}
        </div>

        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-y border-line text-left">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={`${l.id}-${i}`} className="border-b border-line">
                <td className="py-2">
                  {l.name}
                  {l.variant && <span className="text-muted"> · {l.variant}</span>}
                </td>
                <td className="py-2 text-center">{l.qty}</td>
                <td className="py-2 text-right">
                  {formatPrice(l.price)}
                  {l.mrp && l.mrp > l.price && (
                    <span className="block text-xs text-muted line-through">
                      {formatPrice(l.mrp)}
                    </span>
                  )}
                </td>
                <td className="py-2 text-right">{formatPrice(l.price * l.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-4 ml-auto w-full max-w-xs text-sm">
          <div className="flex justify-between py-1">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatPrice(bill.subtotal)}</dd>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between py-1">
              <dt className="text-muted">
                Discount{bill.discountPercent > 0 ? ` (${bill.discountPercent}%)` : ""}
              </dt>
              <dd>− {formatPrice(bill.discount)}</dd>
            </div>
          )}
          {bill.tax > 0 && (
            <div className="flex justify-between py-1">
              <dt className="text-muted">GST {BILLING.taxPercent}%</dt>
              <dd>{formatPrice(bill.tax)}</dd>
            </div>
          )}
          {bill.delivery > 0 && (
            <div className="flex justify-between py-1">
              <dt className="text-muted">Delivery</dt>
              <dd>+ {formatPrice(bill.delivery)}</dd>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-line py-2 font-display text-xl font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(bill.total)}</dd>
          </div>
          <div className="flex justify-between py-1">
            <dt className="text-muted">Paid by</dt>
            <dd className="font-semibold">{bill.payment}</dd>
          </div>
          {saved > 0 && (
            <div className="mt-2 rounded-md bg-accent-soft px-3 py-2 text-center text-sm font-semibold text-accent-dark">
              You saved {formatPrice(saved)} against MRP
            </div>
          )}
        </dl>

        <footer className="mt-6 border-t border-line pt-4 text-xs text-muted">
          <p>{BILLING.footerNote}</p>
          {bill.createdBy && <p className="mt-1">Billed by {bill.createdBy}</p>}
        </footer>
      </article>
    </div>
  );
}

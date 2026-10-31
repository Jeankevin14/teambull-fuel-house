"use client";

import { useState } from "react";

export type PdfBill = {
  billNo: string;
  dateText: string;
  title: string; // "Bill" or "Tax Invoice"
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  gstin?: string;
  fssai?: string;
  customerName: string;
  customerPhone: string;
  lines: { name: string; variant?: string; qty: number; price: number; mrp?: number }[];
  saved: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  taxLabel?: string;
  tax: number;
  total: number;
  payment: string;
  footerNote: string;
  billedBy: string;
};

const rupees = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

/** Loads the shop logo as a data URL so it can be drawn into the PDF. */
async function loadLogo(): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const res = await fetch("/images/teambull-logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    const size = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = data;
    });
    if (!size.w || !size.h) return null;
    return { data, ...size };
  } catch {
    return null;
  }
}

export default function BillPdfButton({ bill }: { bill: PdfBill }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      const [{ jsPDF }, logo] = await Promise.all([import("jspdf"), loadLogo()]);
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const L = 18; // left margin
      const R = 192; // right edge
      let y = 18;

      // Logo on the left, shop details beside it — same shape as the printed bill.
      let logoBottom = y;
      let textX = L;
      if (logo) {
        const w = 24;
        const h = (logo.h / logo.w) * w;
        doc.addImage(logo.data, "PNG", L, y, w, h, undefined, "FAST");
        logoBottom = y + h;
        textX = L + w + 6;
      }

      let ty = y + 7;
      doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(20);
      doc.text(bill.shopName.toUpperCase(), textX, ty);
      ty += 6;
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
      for (const line of doc.splitTextToSize(bill.shopAddress, R - textX) as string[]) {
        doc.text(line, textX, ty);
        ty += 4.4;
      }
      doc.text(`WhatsApp +${bill.shopPhone}`, textX, ty);
      ty += 4.4;
      if (bill.gstin) {
        doc.text(`GSTIN ${bill.gstin}`, textX, ty);
        ty += 4.4;
      }
      if (bill.fssai) {
        doc.text(`FSSAI ${bill.fssai}`, textX, ty);
        ty += 4.4;
      }

      y = Math.max(ty, logoBottom + 4);
      doc.setDrawColor(220, 38, 38).setLineWidth(0.8).line(L, y, R, y);
      y += 9;

      doc.setTextColor(20).setFont("helvetica", "bold").setFontSize(11);
      doc.text(`${bill.title} ${bill.billNo}`, L, y);
      doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
      doc.text(bill.dateText, L, y + 5);

      if (bill.customerName || bill.customerPhone) {
        doc.setTextColor(20).setFont("helvetica", "bold").setFontSize(10);
        doc.text(bill.customerName || "Customer", R, y, { align: "right" });
        if (bill.customerPhone) {
          doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
          doc.text(bill.customerPhone, R, y + 5, { align: "right" });
        }
      }
      y += 13;

      // table head
      const colQty = 118;
      const colRate = 150;
      doc.setTextColor(20).setFont("helvetica", "bold").setFontSize(9);
      doc.setDrawColor(210).setLineWidth(0.2).line(L, y - 4, R, y - 4);
      doc.text("Item", L, y);
      doc.text("Qty", colQty, y, { align: "right" });
      doc.text("Rate", colRate, y, { align: "right" });
      doc.text("Amount", R, y, { align: "right" });
      doc.line(L, y + 2.5, R, y + 2.5);
      y += 8;

      doc.setFont("helvetica", "normal");
      for (const l of bill.lines) {
        const label = l.variant ? `${l.name} (${l.variant})` : l.name;
        const wrapped = doc.splitTextToSize(label, colQty - L - 6) as string[];
        doc.text(wrapped, L, y);
        doc.text(String(l.qty), colQty, y, { align: "right" });
        doc.text(rupees(l.price), colRate, y, { align: "right" });
        doc.text(rupees(l.price * l.qty), R, y, { align: "right" });
        let extra = 0;
        if (l.mrp && l.mrp > l.price) {
          doc.setFontSize(7.5).setTextColor(130);
          doc.text(`MRP ${rupees(l.mrp)}`, colRate, y + 4, { align: "right" });
          doc.setFontSize(9).setTextColor(20);
          extra = 4;
        }
        y += Math.max(wrapped.length * 4.6, 6) + 1.5 + extra;
        doc.setDrawColor(235).line(L, y - 2, R, y - 2);
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
      }

      y += 5;
      const labelX = 150;
      const row = (label: string, value: string, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(bold ? 12 : 9);
        doc.setTextColor(bold ? 20 : 90);
        doc.text(label, labelX, y, { align: "right" });
        doc.setTextColor(20);
        doc.text(value, R, y, { align: "right" });
        y += bold ? 8 : 5.5;
      };

      row("Subtotal", rupees(bill.subtotal));
      if (bill.discount > 0) row(`Discount (${bill.discountPercent}%)`, `- ${rupees(bill.discount)}`);
      if (bill.tax > 0) row(bill.taxLabel ?? "Tax", rupees(bill.tax));
      doc.setDrawColor(210).line(labelX - 30, y - 3, R, y - 3);
      y += 2;
      row("Total", rupees(bill.total), true);
      row("Paid by", bill.payment);
      if (bill.saved > 0) {
        y += 2;
        doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(220, 38, 38);
        doc.text(`You saved ${rupees(bill.saved)} against MRP`, R, y, { align: "right" });
        doc.setTextColor(20);
        y += 6;
      }

      y += 8;
      doc.setDrawColor(220, 38, 38).setLineWidth(0.8).line(L, y, R, y);
      y += 6;
      doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(110);
      for (const line of doc.splitTextToSize(bill.footerNote, R - L) as string[]) {
        doc.text(line, L, y);
        y += 4;
      }
      if (bill.billedBy) doc.text(`Billed by ${bill.billedBy}`, L, y);

      doc.save(`${bill.billNo}.pdf`);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent disabled:opacity-60"
      >
        {busy ? "Making PDF…" : "Download PDF"}
      </button>
      {failed && (
        <span className="mt-1 text-xs text-accent">
          Could not make the PDF. Use Print instead.
        </span>
      )}
    </span>
  );
}

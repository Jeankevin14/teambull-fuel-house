// ============================================================
//  BILLING SETTINGS — edit this file to change how bills look
// ============================================================

export const BILLING = {
  /** Bill numbers look like TFH-2026-27-001 (shop prefix, financial year, count). */
  prefix: "TFH",

  /**
   * GST. Leave `gstin` empty until you actually have a GST number.
   * While it is empty the bill prints as a plain receipt with no tax lines.
   * Once you add your GSTIN and a tax percent, the bill shows the tax split.
   * Check the format with your accountant before you switch this on.
   */
  gstin: "",
  taxPercent: 0,

  /**
   * Delivery charge. The counter can always type any amount; these are just the
   * one-tap buttons beside the box, so the usual amounts take one click.
   * Edit the list to whatever you normally charge. 0 is always offered as "None".
   */
  deliveryPresets: [40, 60, 80, 100] as const,

  /** Delivery is added on top, after the discount and after GST. */
  maxDelivery: 10_000,

  /** Printed at the bottom of every bill. */
  footerNote:
    "Thank you for shopping with us. Please keep this bill for any exchange.",

  paymentMethods: ["Cash", "UPI", "Card", "Pending"] as const,
} as const;

export type PaymentMethod = (typeof BILLING.paymentMethods)[number];

export function gstEnabled() {
  return BILLING.gstin.trim() !== "" && BILLING.taxPercent > 0;
}

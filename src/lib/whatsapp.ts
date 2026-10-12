import { SITE } from "@/config/site";
import type { CartItem } from "@/types";
import { formatPrice } from "@/lib/format";

/** Builds the wa.me link with the order message already typed. */
export function buildOrderUrl(items: CartItem[], total: number) {
  const lines = items.map(
    (item, i) =>
      `${i + 1}. ${item.name}${item.variant ? ` (${item.variant})` : ""} x ${item.qty} = ${formatPrice(item.price * item.qty)}`
  );

  const message = [
    `Hello ${SITE.name}! I'd like to order:`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "Please confirm the final price, delivery charges and payment details.",
  ].join("\n");

  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** A plain "chat with us" link (used by the floating button). */
export function buildChatUrl(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

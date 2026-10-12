import type { Product } from "@/types";

/** true if the customer must pick a flavour or size first */
export function hasOptions(p: Product) {
  return Boolean(p.flavours?.length || p.sizes?.length);
}

/** the lowest price (used for "From ₹..." and for sorting) */
export function startingPrice(p: Product) {
  return p.sizes?.length ? Math.min(...p.sizes.map((s) => s.price)) : p.price;
}

/** the price for a chosen size (first size if none chosen) */
export function priceFor(p: Product, sizeLabel?: string) {
  if (!p.sizes?.length) return p.price;
  const size = p.sizes.find((s) => s.label === sizeLabel) ?? p.sizes[0];
  return size.price;
}

export function isInStock(p: Product) {
  return p.inStock !== false;
}

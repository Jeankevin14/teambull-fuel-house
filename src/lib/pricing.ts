import type { Product } from "@/types";

export type Saving = {
  mrp: number;
  price: number;
  amount: number;
  percent: number;
};

/**
 * What the customer saves against the MRP — or null when there is nothing to show.
 *
 * An MRP is only worth printing when it is above what we charge. A product with no
 * MRP on the pack, or one priced at its MRP, shows our price on its own.
 */
export function savingOn(price: number, mrp?: number): Saving | null {
  if (!mrp || !Number.isFinite(mrp) || mrp <= price) return null;
  const amount = mrp - price;
  return { mrp, price, amount, percent: Math.round((amount / mrp) * 100) };
}

/** The same thing for a product, at its starting price. */
export function savingForProduct(p: Product, price: number): Saving | null {
  return savingOn(price, p.mrp);
}

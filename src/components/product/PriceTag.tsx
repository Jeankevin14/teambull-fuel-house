import { formatPrice } from "@/lib/format";
import { savingOn } from "@/lib/pricing";

/**
 * Our price, with the MRP struck through and the saving beside it — but only when
 * there is an MRP above our price. Otherwise just the price, on its own.
 */
export default function PriceTag({
  price,
  mrp,
  from = false,
  size = "card",
}: {
  price: number;
  mrp?: number;
  /** show "From" before the price, for products with several sizes */
  from?: boolean;
  size?: "card" | "page";
}) {
  const saving = savingOn(price, mrp);
  const big = size === "page" ? "text-3xl" : "text-xl";

  if (!saving) {
    return (
      <p className={`${big} font-bold`}>
        {from && <span className="mr-1 text-sm font-normal text-muted">From</span>}
        {formatPrice(price)}
      </p>
    );
  }

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        {from && <span className="text-sm font-normal text-muted">From</span>}
        <span className={`${big} font-bold`}>{formatPrice(price)}</span>
        <span className="text-sm text-muted line-through">{formatPrice(saving.mrp)}</span>
      </p>
      <p className="mt-1 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-dark">
        Save {formatPrice(saving.amount)} ({saving.percent}% off)
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { isInStock, priceFor } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";
import PlatePicker from "./PlatePicker";

/** Price, flavour picker, size picker and Add to Cart (product page). */
export default function ProductPurchase({ product }: { product: Product }) {
  const [flavour, setFlavour] = useState(product.flavours?.[0]);
  const [size, setSize] = useState(product.sizes?.[0]?.label);

  const price = priceFor(product, size);

  const choice = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${
      active
        ? "border-accent bg-accent text-white"
        : "border-line hover:border-accent hover:text-accent"
    }`;

  return (
    <div>
      <p className="mt-6 text-3xl font-bold">{formatPrice(price)}</p>
      {!isInStock(product) && (
        <p className="mt-2 inline-block rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold uppercase text-neutral-600">
          Out of stock
        </p>
      )}

      {product.sizes && product.sizes.length > 1 && (
        <div className="mt-6">
          <PlatePicker sizes={product.sizes} value={size} onChange={setSize} />
        </div>
      )}

      {product.sizes && product.sizes.length === 1 && (
        <div className="mt-6">
          <p className="text-sm font-semibold">
            Size: <span className="font-normal text-muted">{size}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s.label}
                onClick={() => setSize(s.label)}
                className={choice(size === s.label)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.flavours && product.flavours.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold">
            Flavour: <span className="font-normal text-muted">{flavour}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.flavours.map((f) => (
              <button
                key={f}
                onClick={() => setFlavour(f)}
                className={choice(flavour === f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <AddToCartButton product={product} flavour={flavour} size={size} />
    </div>
  );
}

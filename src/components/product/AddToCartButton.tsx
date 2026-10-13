"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { flyToCart } from "@/lib/flyToCart";
import { stampAdded } from "@/lib/motion";
import { isInStock } from "@/lib/products";
import type { Product } from "@/types";

export default function AddToCartButton({
  product,
  flavour,
  size,
}: {
  product: Product;
  flavour?: string;
  size?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  // sold out: show a grey, disabled button
  if (!isInStock(product)) {
    return (
      <button
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-full bg-neutral-200 py-3 font-semibold text-neutral-500"
      >
        Out of stock
      </button>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    flyToCart(e.currentTarget);
    stampAdded(e.currentTarget);
    add(product, { flavour, size });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 font-semibold text-white transition active:scale-95 ${
        added ? "anim-pop bg-green-600" : "bg-accent hover:opacity-90"
      }`}
    >
      {added ? (
        <>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="anim-check" d="M5 13l4 4L19 7" />
          </svg>
          Added to Cart
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
            <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
          </svg>
          Add to Cart
        </>
      )}
    </button>
  );
}

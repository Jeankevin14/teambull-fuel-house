"use client";

import { useCart } from "@/context/CartContext";

/** The red Cart button in the header. Opens the sliding cart panel. */
export default function CartLink() {
  const { count, ready, openDrawer } = useCart();

  return (
    <button
      type="button"
      data-cart-button
      onClick={openDrawer}
      aria-label={`Open cart, ${ready ? count : 0} items`}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-semibold text-white hover:opacity-90"
    >
      <svg
        key={`icon-${ready ? count : 0}`}
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${ready && count > 0 ? "anim-wiggle" : ""}`}
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
      Cart
      {ready && count > 0 && (
        // key={count} restarts the "pop" animation every time the number changes
        <span
          key={count}
          className="anim-pop inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-accent"
        >
          {count}
        </span>
      )}
    </button>
  );
}

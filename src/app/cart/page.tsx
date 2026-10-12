"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { buildOrderUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, total, ready, setQty, remove, clear } = useCart();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-muted">Loading…</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-bold uppercase">
          Your cart is <span className="text-accent">empty</span>
        </h1>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-full bg-accent px-8 py-4 font-semibold text-white hover:opacity-90"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    window.open(buildOrderUrl(items, total), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold uppercase">
        Your <span className="text-accent">Cart</span>
      </h1>

      <div className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
        {items.map((item) => (
          <div key={item.key} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.name}</p>
              {item.variant && (
                <p className="text-sm text-muted">{item.variant}</p>
              )}
              <p className="text-sm text-muted">
                {formatPrice(item.price)} each
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(item.key, item.qty - 1)}
                className="h-9 w-9 rounded-full border border-line hover:border-accent"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center">{item.qty}</span>
              <button
                onClick={() => setQty(item.key, item.qty + 1)}
                className="h-9 w-9 rounded-full border border-line hover:border-accent"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-bold">
              {formatPrice(item.price * item.qty)}
            </p>

            <button
              onClick={() => remove(item.key)}
              className="text-sm text-muted hover:text-accent"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xl">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-accent">{formatPrice(total)}</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        Delivery charges and the final price are confirmed with you on WhatsApp.
      </p>

      <button
        onClick={handleCheckout}
        className="mt-6 w-full rounded-full bg-green-500 py-4 text-lg font-semibold text-white hover:bg-green-600"
      >
        Checkout on WhatsApp
      </button>

      <button
        onClick={clear}
        className="mt-4 w-full text-sm text-muted hover:text-accent"
      >
        Clear cart
      </button>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/components/cart/useCheckout";
import { formatPrice } from "@/lib/format";

/** The cart panel that slides in from the right (like big supplement shops). */
export default function CartDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    lastAdded,
    items,
    count,
    total,
    ready,
    setQty,
    remove,
  } = useCart();

  const { checkout: runCheckout, label: checkoutLabel } = useCheckout(closeDrawer);

  // close with the Escape key, and stop the page behind from scrolling
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  const checkout = () => runCheckout(items, total);

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* dark background; click it to close */}
      <div
        className="anim-fade absolute inset-0 bg-black/40"
        onClick={closeDrawer}
      />

      <aside className="anim-drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl font-bold uppercase">
            Your <span className="text-accent">Cart</span>
            {ready && count > 0 && (
              <span className="ml-2 text-sm font-normal normal-case text-muted">
                ({count} {count === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-muted hover:bg-surface hover:text-accent"
          >
            ×
          </button>
        </div>

        {/* "Added to cart" green banner */}
        {lastAdded && (
          <div className="anim-fade flex items-center gap-3 bg-green-50 px-5 py-3 text-sm text-green-800">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className="anim-check" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="min-w-0">
              <strong className="font-semibold">Added to cart:</strong>{" "}
              <span className="break-words">{lastAdded}</span>
            </span>
          </div>
        )}

        {/* items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-2xl font-bold uppercase">
              Your cart is <span className="text-accent">empty</span>
            </p>
            <p className="mt-2 text-sm text-muted">
              Add some supplements to get started.
            </p>
            <Link
              href="/products"
              onClick={closeDrawer}
              className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${item.id}`}
                    onClick={closeDrawer}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center font-display text-3xl text-accent/30">
                        {item.name.charAt(0)}
                      </span>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold leading-snug">
                          {item.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-muted">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="text-xs text-muted hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {formatPrice(item.price)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          onClick={() => setQty(item.key, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="h-8 w-8 rounded-full hover:text-accent"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => setQty(item.key, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="h-8 w-8 rounded-full hover:text-accent"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* footer */}
            <div className="border-t border-line bg-surface px-5 py-5">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold text-accent">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Delivery charges and the final price are confirmed with you on
                WhatsApp.
              </p>

              <button
                onClick={checkout}
                className="mt-4 w-full rounded-full bg-green-500 py-3.5 text-base font-semibold text-white hover:bg-green-600"
              >
                {checkoutLabel}
              </button>

              <div className="mt-3 flex items-center justify-between text-sm">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="font-medium text-muted hover:text-accent"
                >
                  View full cart
                </Link>
                <button
                  onClick={closeDrawer}
                  className="font-medium text-muted hover:text-accent"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { BillableProduct } from "./BillingPanel";

/**
 * Counter-style product search. Type a few letters of the product, brand or
 * category, then press Enter to put it on the bill. The box clears and keeps
 * focus, so several items can be added without touching the mouse.
 */
export default function ProductPicker({
  products,
  onPick,
}: {
  products: BillableProduct[];
  onPick: (product: BillableProduct) => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [justAdded, setJustAdded] = useState("");
  const boxRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/);
    return products
      .filter((p) => {
        const hay = `${p.name} ${p.brand ?? ""} ${p.category ?? ""}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .slice(0, 8);
  }, [products, query]);

  function add(product: BillableProduct) {
    onPick(product);
    setJustAdded(product.name);
    setQuery("");
    setCursor(0);
    boxRef.current?.focus();
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = matches[cursor];
      if (hit) add(hit);
    } else if (e.key === "Escape") {
      setQuery("");
      setCursor(0);
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-foreground" htmlFor="bill-search">
        Add a product
      </label>
      <input
        id="bill-search"
        ref={boxRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCursor(0);
          setJustAdded("");
        }}
        onKeyDown={onKey}
        autoComplete="off"
        placeholder="Type a product, brand or category — then press Enter"
        className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-3 text-foreground outline-none focus:border-accent"
      />

      {justAdded && !query && (
        <p className="mt-1 text-sm text-green-700">Added {justAdded}. Type the next one.</p>
      )}

      {query.trim() !== "" && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-line bg-white shadow-lg">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">
              Nothing matches “{query}”. Check the spelling, or add it as a product first.
            </p>
          ) : (
            <ul>
              {matches.map((p, i) => {
                const out = p.stock !== undefined && p.stock <= 0;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => add(p)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${
                        i === cursor ? "bg-accent-soft" : "bg-white"
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-foreground">
                          {p.name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {[p.brand, p.category].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="flex-none text-right">
                        <span className="block font-semibold">{formatPrice(p.price)}</span>
                        <span
                          className={`block text-xs ${out ? "font-semibold text-accent" : "text-muted"}`}
                        >
                          {p.stock === undefined
                            ? "stock not tracked"
                            : out
                              ? "out of stock"
                              : `${p.stock} left`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

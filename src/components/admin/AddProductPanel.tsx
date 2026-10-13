"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import ProductStudio from "./ProductStudio";

/**
 * The "Add a new product" area. It stays open while you work, shows a message after
 * each save, and gives a clean form for the next product.
 */
export default function AddProductPanel({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [round, setRound] = useState(0);
  const [added, setAdded] = useState<{ id: number; name: string } | null>(null);

  const done = useCallback((info: { id: number; name: string }) => {
    setAdded(info);
    setRound((r) => r + 1);
  }, []);

  return (
    <details
      className="mt-6 rounded-xl border border-line bg-surface p-5"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer font-display text-xl font-bold uppercase">
        Add a <span className="text-accent">new product</span>
      </summary>
      <div className="mt-4">
        {added && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✓ “{added.name}” is added and live on the website.{" "}
            <Link href={`/products/${added.id}`} className="underline">
              View it on the shop
            </Link>
          </p>
        )}
        <ProductStudio key={round} onSaved={done} />
      </div>
    </details>
  );
}

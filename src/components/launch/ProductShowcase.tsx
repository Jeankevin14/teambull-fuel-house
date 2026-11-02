"use client";

import { useEffect, useState } from "react";

export type RangeGroup = { category: string; names: string[] };

/**
 * Scene 4 — the range, read out rather than shown.
 * One category at a time, its products named, with the real totals underneath.
 * No pack photographs: the words are the picture.
 */
export default function ProductShowcase({
  groups,
  productCount,
  categoryCount,
  hold = 2000,
}: {
  groups: RangeGroup[];
  productCount: number;
  categoryCount: number;
  /** how long each category owns the screen */
  hold?: number;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (groups.length < 2) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % groups.length), hold);
    return () => window.clearInterval(t);
  }, [groups.length, hold]);

  const g = groups[i];
  if (!g) return null;

  return (
    <div className="tb-scene">
      <p className="tb-eyebrow">The range</p>

      <h2 key={`c${i}`} className="tb-head" style={{ fontSize: "clamp(1.5rem,5.4vw,3.2rem)" }}>
        {g.category}
      </h2>

      <div key={`n${i}`} className="tb-names">
        {g.names.map((name, n) => (
          <p key={name} className="tb-name" style={{ animationDelay: `${0.15 + n * 0.22}s` }}>
            {name}
          </p>
        ))}
      </div>

      <span className="tb-hair" style={{ animationDelay: "0.9s" }} aria-hidden="true" />

      <p className="tb-count" style={{ animationDelay: "1s" }}>
        {productCount}
      </p>
      <p className="tb-sub" style={{ marginTop: -4 }}>
        supplements in stock · {categoryCount} categories
      </p>
    </div>
  );
}

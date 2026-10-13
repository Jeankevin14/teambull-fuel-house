"use client";

import type { ProductSize } from "@/types";

const COLORS = ["#dc2626", "#171717", "#e5e5e5", "#f5b301", "#dc2626", "#171717"];

/**
 * Size picker shaped like a barbell: drag the slider (or tap a size)
 * and more weight plates load onto both ends of the bar.
 */
export default function PlatePicker({
  sizes,
  value,
  onChange,
}: {
  sizes: ProductSize[];
  value: string | undefined;
  onChange: (label: string) => void;
}) {
  const found = sizes.findIndex((s) => s.label === value);
  const idx = found < 0 ? 0 : found;

  const plates = Array.from({ length: Math.min(idx + 1, 6) }, (_, i) => (
    <i
      key={i}
      className="plate-in"
      style={{
        height: Math.max(34, 74 - i * 9),
        background: COLORS[i % COLORS.length],
        border: COLORS[i % COLORS.length] === "#e5e5e5" ? "1px solid #aaa" : undefined,
      }}
    />
  ));

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-end justify-between">
        <p className="text-sm font-semibold">Pack size</p>
        <p key={idx} className="anim-pop font-display text-3xl font-bold uppercase leading-none text-accent">
          {sizes[idx].label}
        </p>
      </div>

      <div className="plate-bar" aria-hidden="true">
        <div className="plate-side plate-left">{plates}</div>
        <div className="plate-rod" />
        <div className="plate-side">{plates}</div>
      </div>

      <input
        type="range"
        min={0}
        max={sizes.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(sizes[Number(e.target.value)].label)}
        aria-label="Pack size"
        aria-valuetext={sizes[idx].label}
        className="w-full cursor-pointer accent-[var(--accent)]"
      />
      <div className="mt-1 flex justify-between">
        {sizes.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onChange(s.label)}
            className={`text-xs font-semibold ${
              i === idx ? "text-accent" : "text-muted hover:text-accent"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

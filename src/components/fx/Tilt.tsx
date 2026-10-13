"use client";

import { useRef, type ReactNode } from "react";

/** 3D tilt: the card leans toward the mouse and a soft shine follows it. Desktop only. */
export default function Tilt({
  children,
  max = 8,
  className = "",
}: {
  children: ReactNode;
  max?: number; // degrees
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useRef<boolean | null>(null);

  const enabled = () => {
    if (fine.current === null) {
      fine.current =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return fine.current;
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    el.dataset.active = "1";
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.active;
  };

  return (
    <div className={`tilt-wrap ${className}`}>
      <div
        ref={ref}
        className="tilt"
        onPointerMove={onMove}
        onPointerLeave={reset}
      >
        {children}
        <span className="tilt-shine" aria-hidden="true" />
      </div>
    </div>
  );
}

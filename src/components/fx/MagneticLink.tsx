"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/** A link/button that leans toward the mouse as it gets close, then snaps back. */
export default function MagneticLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const btn = useRef<HTMLAnchorElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = btn.current;
    if (!el || e.pointerType === "touch") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  };
  const leave = () => {
    if (btn.current) btn.current.style.transform = "";
  };

  return (
    <span
      className="-m-4 inline-block p-4"
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <Link
        ref={btn}
        href={href}
        className={`magnetic ${className}`}
      >
        {children}
      </Link>
    </span>
  );
}

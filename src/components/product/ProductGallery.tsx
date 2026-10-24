"use client";

import { useRef, useState } from "react";
import type { Product } from "@/types";
import ProductImage from "./ProductImage";

/**
 * Two-slide product gallery.
 *   Slide 1 - the product photo
 *   Slide 2 - the nutrition / supplement facts label, when we have an authentic one
 * Swipe left and right on a phone, arrows and dots on a desktop.
 * A product with no nutrition image simply shows one slide and no controls.
 */
export default function ProductGallery({
  product,
  nutritionImage,
}: {
  product: Product;
  nutritionImage?: string;
}) {
  const slides = nutritionImage ? 2 : 1;
  const [slide, setSlide] = useState(0);
  const [nutritionBroken, setNutritionBroken] = useState(false);
  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);

  const total = nutritionBroken ? 1 : slides;
  const go = (n: number) => setSlide(Math.min(total - 1, Math.max(0, n)));

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchX.current = null;
    touchY.current = null;
    // ignore mostly-vertical movement so page scrolling still works
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? slide + 1 : slide - 1);
  }

  const arrow =
    "absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/90 p-2 text-foreground shadow-sm transition hover:border-accent hover:text-accent md:flex";

  return (
    <div className="select-none">
      <div
        className="relative overflow-hidden rounded-xl bg-surface"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${product.name} images`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(slide + 1);
          if (e.key === "ArrowLeft") go(slide - 1);
        }}
      >
        <div
          className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          <div className="w-full shrink-0" aria-hidden={slide !== 0}>
            <ProductImage
              product={product}
              className="h-80 md:h-96"
              letterSize="text-7xl"
            />
          </div>

          {nutritionImage && !nutritionBroken && (
            <div className="w-full shrink-0" aria-hidden={slide !== 1}>
              <div className="relative flex h-80 items-center justify-center bg-white p-2 md:h-96">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nutritionImage}
                  alt={`Nutrition information for ${product.name}`}
                  loading="lazy"
                  onError={() => {
                    // a missing label must never leave a broken image on the page
                    setNutritionBroken(true);
                    setSlide(0);
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(slide - 1)}
              disabled={slide === 0}
              aria-label="Previous image"
              className={`${arrow} left-2 disabled:pointer-events-none disabled:opacity-0`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(slide + 1)}
              disabled={slide === total - 1}
              aria-label="Next image"
              className={`${arrow} right-2 disabled:pointer-events-none disabled:opacity-0`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
            <span className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white md:hidden">
              {slide === 0 ? "Swipe for nutrition" : "Nutrition facts"}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={i === 0 ? "Show product photo" : "Show nutrition facts"}
              aria-current={slide === i}
              className={`h-2.5 rounded-full transition-all ${
                slide === i ? "w-6 bg-accent" : "w-2.5 bg-line hover:bg-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

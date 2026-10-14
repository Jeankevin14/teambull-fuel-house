"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { BUNDLES } from "@/config/bundles";
import { useCart } from "@/context/CartContext";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/format";
import { isInStock, priceFor } from "@/lib/products";
import ProductImage from "@/components/product/ProductImage";

type Override = { pid?: number; flavour?: string; size?: string };

const chip = (on: boolean) =>
  `rounded-full border px-3 py-1 text-xs font-semibold transition ${
    on ? "border-accent bg-accent text-white" : "border-line bg-white hover:border-accent hover:text-accent"
  }`;

/** the same pack with different choices must be a different cart line */
function hashId(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return -(Math.abs(h) + 1);
}

function Operator({ children }: { children: string }) {
  return (
    <div className="flex shrink-0 items-center justify-center self-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-xl font-bold text-white">
        {children}
      </span>
    </div>
  );
}

function ShakerIcon() {
  return (
    <svg viewBox="0 0 64 80" className="h-20 w-16" aria-hidden="true">
      <rect x="20" y="4" width="24" height="9" rx="4" fill="#1a1a1a" />
      <rect x="14" y="13" width="36" height="9" rx="3" fill="#dc2626" />
      <path d="M16 22h32l-3 50a6 6 0 0 1-6 5H25a6 6 0 0 1-6-5z" fill="#fff" stroke="#1a1a1a" strokeWidth="2.5" />
      <path d="M19 44h26l-1.6 28a4 4 0 0 1-4 3.4H24.6a4 4 0 0 1-4-3.4z" fill="#dc2626" opacity=".85" />
      <path d="M24 30v10M24 52v8" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" opacity=".25" />
    </svg>
  );
}

export default function BundleBuilder({ products }: { products: Product[] }) {
  const { add } = useCart();
  const available = BUNDLES.filter((b) =>
    b.categories.every((c) => products.some((p) => p.category === c && isInStock(p))),
  );
  const [bundleId, setBundleId] = useState(available[0]?.id ?? "");
  const [over, setOver] = useState<Record<string, Override>>({});
  const [added, setAdded] = useState(false);

  const bundle = available.find((b) => b.id === bundleId) ?? available[0];
  if (!bundle) {
    return (
      <p className="text-muted">
        Combo packs are coming soon. See all <Link href="/products" className="text-accent underline">products</Link>.
      </p>
    );
  }

  const slots = bundle.categories.map((cat) => {
    const list = products.filter((p) => p.category === cat && isInStock(p));
    const key = `${bundle.id}:${cat}`;
    const ov = over[key] ?? {};
    const product = list.find((p) => p.id === ov.pid) ?? list[0];
    const flavour = product.flavours?.includes(ov.flavour ?? "") ? ov.flavour : product.flavours?.[0];
    const size = product.sizes?.some((s) => s.label === ov.size) ? ov.size : product.sizes?.[0]?.label;
    return { cat, key, list, product, flavour, size, price: priceFor(product, size) };
  });

  const patch = (key: string, change: Override, reset = false) =>
    setOver((o) => ({ ...o, [key]: reset ? change : { ...o[key], ...change } }));

  const total = slots.reduce((n, s) => n + s.price, 0);
  const saving = Math.round((total * bundle.discount) / 100);
  const packPrice = total - saving;

  const detail =
    slots
      .map((s) => {
        const opts = [s.flavour, s.size].filter(Boolean).join(", ");
        return `${s.product.name}${opts ? ` (${opts})` : ""}`;
      })
      .join(" + ") + (bundle.perk ? ` + ${bundle.perk}` : "");

  function addPack(e: React.MouseEvent<HTMLButtonElement>) {
    flyToCart(e.currentTarget);
    const pack: Product = {
      id: hashId(bundle.id + detail),
      name: bundle.name,
      brand: "Teambull",
      category: slots[0].product.category,
      price: packPrice,
      description: detail,
      image: slots[0].product.image,
      inStock: true,
    };
    add(pack, { flavour: detail });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-8">
      {/* pack picker */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {available.map((b) => {
          const on = b.id === bundle.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBundleId(b.id);
                setAdded(false);
              }}
              aria-pressed={on}
              className={`relative flex flex-col rounded-2xl border-2 p-4 text-left transition hover:-translate-y-0.5 ${
                on ? "border-accent bg-accent text-white shadow-lg" : "border-line bg-surface hover:border-accent"
              }`}
            >
              {b.discount > 0 && (
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    on ? "bg-white text-accent" : "bg-accent text-white"
                  }`}
                >
                  Save {b.discount}%
                </span>
              )}
              <span className={`font-display text-sm font-bold ${on ? "text-white/80" : "text-accent"}`}>
                {b.categories.length + (b.perk ? 1 : 0)} items
              </span>
              <span className="mt-4 pr-2 font-display text-xl font-bold uppercase leading-tight">{b.name}</span>
              <span className={`mt-1 text-sm ${on ? "text-white/90" : "text-muted"}`}>{b.tagline}</span>
            </button>
          );
        })}
      </div>

      {/* the pack */}
      <div key={bundle.id} className="bmi-step rounded-3xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2 px-1">
          <h2 className="font-display text-3xl font-bold uppercase">{bundle.name}</h2>
          <p className="text-sm font-semibold text-accent">Choose your flavour and size</p>
        </div>

        <div className="mt-5 flex flex-col items-stretch gap-3 lg:flex-row">
          {slots.map((s, i) => (
            <div key={s.key} className="contents">
              {i > 0 && <Operator>+</Operator>}
              <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">{s.cat}</p>
                <ProductImage product={s.product} className="mt-2 h-32" letterSize="text-3xl" />
                <p className="mt-2 font-semibold leading-snug">{s.product.name}</p>

                {s.list.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.list.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => patch(s.key, { pid: p.id }, true)}
                        aria-pressed={p.id === s.product.id}
                        className={chip(p.id === s.product.id)}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                )}
                {s.product.sizes && s.product.sizes.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold text-muted">Size</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.product.sizes.map((z) => (
                        <button key={z.label} type="button" onClick={() => patch(s.key, { size: z.label })} aria-pressed={s.size === z.label} className={chip(s.size === z.label)}>
                          {z.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {s.product.flavours && s.product.flavours.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold text-muted">Flavour</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.product.flavours.map((f) => (
                        <button key={f} type="button" onClick={() => patch(s.key, { flavour: f })} aria-pressed={s.flavour === f} className={chip(s.flavour === f)}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p key={s.price} className="anim-pop mt-auto pt-4 font-display text-2xl font-bold tabular-nums">
                  {formatPrice(s.price)}
                </p>
              </div>
            </div>
          ))}

          {bundle.perk && (
            <div className="contents">
              <Operator>+</Operator>
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent-soft p-4 text-center lg:max-w-[11rem]">
                <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-bold uppercase text-white">Free</span>
                <ShakerIcon />
                <p className="font-display text-lg font-bold uppercase leading-tight">{bundle.perk.replace(/^Free /i, "")}</p>
              </div>
            </div>
          )}
        </div>

        {/* total */}
        <div className="mt-6 grid items-center gap-5 rounded-2xl bg-foreground p-5 text-white md:grid-cols-[1fr_auto] md:p-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-white/70">
              {saving > 0 ? (
                <>Bought separately <span className="line-through">{formatPrice(total)}</span></>
              ) : (
                <>Pack total · {slots.length + (bundle.perk ? 1 : 0)} items</>
              )}
            </p>
            <p key={packPrice} className="anim-pop font-display text-6xl font-bold leading-tight tabular-nums">
              {formatPrice(packPrice)}
            </p>
            {saving > 0 && (
              <p className="mt-1 inline-block rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-white">
                You save {formatPrice(saving)} ({bundle.discount}%)
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={addPack}
            className={`btn-shine rounded-full px-10 py-4 text-lg font-bold text-white transition active:scale-95 ${
              added ? "anim-pop bg-green-600" : "bg-accent hover:bg-accent-dark"
            }`}
          >
            {added ? "Pack added ✓" : "Add pack to cart"}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-muted">
        The whole pack goes into your cart as one item. Check out on WhatsApp as usual.
      </p>
    </div>
  );
}

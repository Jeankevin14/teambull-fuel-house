"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { saveProductAction } from "@/app/actions/admin";
import { CATEGORIES } from "@/config/site";
import ProductCard from "@/components/product/ProductCard";
import type { FormState } from "@/types/forms";
import type { Product, ProductSize } from "@/types";

const fieldBase =
  "rounded-lg border border-line bg-white px-3 py-2.5 text-foreground outline-none focus:border-accent";
const field = `mt-1 w-full ${fieldBase}`;
const labelCls = "block text-sm font-semibold text-foreground";
const hint = "font-normal text-muted";

const SUGGESTED_FLAVOURS = ["Chocolate", "Vanilla", "Strawberry", "Banana", "Cookies & Cream", "Mango"];
const SIZE_PRESETS = ["250g", "500g", "1kg", "2kg", "3kg", "60 tabs"];
const MAX_IMAGE_CHARS = 45000; // a Google Sheet cell holds 50,000 characters

type SizeRow = { key: number; label: string; price: string };

let rowCounter = 0;
function makeRow(label = "", price = ""): SizeRow {
  rowCounter += 1;
  return { key: rowCounter, label, price };
}

/** Shrinks the chosen photo so it fits in one sheet cell. Runs in the browser. */
async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let side = 560;
  for (let round = 0; round < 8; round++) {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    for (const q of [0.82, 0.72, 0.62, 0.5]) {
      const url = canvas.toDataURL("image/jpeg", q);
      if (url.length <= MAX_IMAGE_CHARS) return url;
    }
    side = Math.round(side * 0.8);
  }
  throw new Error("too big");
}

type Initial = {
  id?: number;
  name?: string;
  brand?: string;
  category?: string;
  price?: number;
  description?: string;
  image?: string;
  flavours?: string[];
  sizes?: ProductSize[];
  stock?: number;
  active?: boolean;
};

export default function ProductStudio({
  initial = {},
  onSaved,
}: {
  initial?: Initial;
  onSaved?: (info: { id: number; name: string }) => void;
}) {
  const editing = initial.id !== undefined;
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, { ok: false });

  const [name, setName] = useState(initial.name ?? "");
  const [brand, setBrand] = useState(initial.brand ?? "");
  const [category, setCategory] = useState<string>(initial.category ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [price, setPrice] = useState(initial.price !== undefined ? String(initial.price) : "");
  const [image, setImage] = useState(initial.image ?? "");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [sizesOn, setSizesOn] = useState(Boolean(initial.sizes?.length));
  const [sizes, setSizes] = useState<SizeRow[]>(() =>
    initial.sizes?.length
      ? initial.sizes.map((s) => makeRow(s.label, String(s.price)))
      : [makeRow(), makeRow()]
  );

  const [flavours, setFlavours] = useState<string[]>(initial.flavours ?? []);
  const [flavourText, setFlavourText] = useState("");

  const [trackStock, setTrackStock] = useState(initial.stock !== undefined || !editing);
  const [stock, setStock] = useState(initial.stock !== undefined ? initial.stock : 20);
  const [active, setActive] = useState(initial.active ?? true);

  // ----- helpers -----
  const addFlavour = (raw: string) => {
    const f = raw.trim();
    if (f && !flavours.some((x) => x.toLowerCase() === f.toLowerCase())) setFlavours([...flavours, f]);
    setFlavourText("");
  };

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose a picture (JPG or PNG).");
      return;
    }
    setImageBusy(true);
    try {
      setImage(await shrinkImage(file));
    } catch {
      setImageError("Could not use that picture. Try a different one.");
    }
    setImageBusy(false);
  };

  const cleanSizes = useMemo(
    () =>
      sizesOn
        ? sizes
            .map((s) => ({ label: s.label.trim(), price: Number(s.price.replace(/[₹,\s]/g, "")) }))
            .filter((s) => s.label && Number.isFinite(s.price) && s.price > 0)
        : [],
    [sizesOn, sizes]
  );
  const sizesText = cleanSizes.map((s) => `${s.label}:${s.price}`).join("|");

  // live preview, built from what is typed right now
  const preview: Product = {
    id: initial.id ?? 0,
    name: name.trim() || "Product name",
    brand: brand.trim(),
    category: (category || CATEGORIES[0]) as Product["category"],
    price: cleanSizes[0]?.price ?? (Number(price.replace(/[₹,\s]/g, "")) || 0),
    description: description.trim() || "Your description appears here.",
    image: image || undefined,
    flavours: flavours.length ? flavours : undefined,
    sizes: cleanSizes.length ? cleanSizes : undefined,
    stock: trackStock ? stock : undefined,
    inStock: trackStock ? stock > 0 : true,
  };

  // tell the parent once when a save succeeds
  const told = useRef<FormState | null>(null);
  useEffect(() => {
    if (state.ok && state.id !== undefined && told.current !== state) {
      told.current = state;
      onSaved?.({ id: state.id, name: name.trim() });
    }
  }, [state, onSaved, name]);

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* hidden values the server reads */}
      {editing && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="sizes" value={sizesText} />
      <input type="hidden" name="flavours" value={flavours.join(", ")} />
      <input type="hidden" name="stock" value={trackStock ? stock : ""} />

      <div className="space-y-6">
        {/* 1. basics */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold uppercase">
            1. <span className="text-accent">Basics</span>
          </h3>
          <label className={labelCls}>
            Product name
            <input
              name="name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gold Standard Whey"
              className={field}
            />
          </label>
          <label className={labelCls}>
            Brand
            <input
              name="brand"
              maxLength={60}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={field}
            />
          </label>
          <div>
            <p className={labelCls}>Category</p>
            <input type="hidden" name="category" value={category} />
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    category === c
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-white text-foreground hover:border-accent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <label className={labelCls}>
            Description{" "}
            <span className={hint}>
              ({description.length}/400)
            </span>
            <textarea
              name="description"
              rows={3}
              maxLength={400}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
          </label>
        </section>

        {/* 2. photo */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold uppercase">
            2. <span className="text-accent">Photo</span>
          </h3>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void pickFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex flex-wrap items-center gap-4 rounded-xl border-2 border-dashed p-4 transition ${
              dragOver ? "border-accent bg-accent-soft" : "border-line bg-white"
            }`}
          >
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs text-muted">No photo</span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm text-muted">Drag a picture here, or</p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
                  {imageBusy ? "Preparing…" : image ? "Change photo" : "Choose photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      void pickFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground hover:border-accent hover:text-accent"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-muted">
                The picture is made smaller automatically. A clear photo on a plain background looks best.
              </p>
              {imageError && <p className="text-sm text-accent-dark">{imageError}</p>}
            </div>
          </div>
        </section>

        {/* 3. price & sizes */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold uppercase">
            3. <span className="text-accent">Price &amp; sizes</span>
          </h3>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={sizesOn}
              onChange={(e) => setSizesOn(e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            This product comes in different sizes
          </label>

          {sizesOn ? (
            <div className="space-y-2">
              {sizes.map((row, i) => (
                <div key={row.key} className="flex items-center gap-2">
                  <input
                    aria-label={`Size ${i + 1} name`}
                    value={row.label}
                    onChange={(e) =>
                      setSizes(sizes.map((s) => (s.key === row.key ? { ...s, label: e.target.value } : s)))
                    }
                    placeholder="e.g. 1kg"
                    list="size-presets"
                    className={`${fieldBase} min-w-0 flex-1`}
                  />
                  <span className="text-muted">₹</span>
                  <input
                    aria-label={`Size ${i + 1} price`}
                    inputMode="numeric"
                    value={row.price}
                    onChange={(e) =>
                      setSizes(sizes.map((s) => (s.key === row.key ? { ...s, price: e.target.value } : s)))
                    }
                    placeholder="Price"
                    className={`${fieldBase} w-32`}
                  />
                  <button
                    type="button"
                    aria-label="Remove this size"
                    onClick={() => setSizes(sizes.length > 1 ? sizes.filter((s) => s.key !== row.key) : sizes)}
                    className="h-10 w-10 rounded-lg border border-line text-lg text-muted hover:border-accent hover:text-accent"
                  >
                    ×
                  </button>
                </div>
              ))}
              <datalist id="size-presets">
                {SIZE_PRESETS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={() => setSizes([...sizes, makeRow()])}
                className="text-sm font-semibold text-accent hover:underline"
              >
                + Add another size
              </button>
            </div>
          ) : (
            <label className={labelCls}>
              Price (₹)
              <input
                name="price"
                inputMode="numeric"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1999"
                className={`${fieldBase} mt-1 block w-full max-w-48`}
              />
            </label>
          )}
        </section>

        {/* 4. flavours */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold uppercase">
            4. <span className="text-accent">Flavours</span> <span className={`text-sm ${hint}`}>(optional)</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-white p-2">
            {flavours.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-dark"
              >
                {f}
                <button
                  type="button"
                  aria-label={`Remove ${f}`}
                  onClick={() => setFlavours(flavours.filter((x) => x !== f))}
                  className="text-base leading-none hover:text-accent"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={flavourText}
              onChange={(e) => setFlavourText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addFlavour(flavourText);
                } else if (e.key === "Backspace" && !flavourText && flavours.length) {
                  setFlavours(flavours.slice(0, -1));
                }
              }}
              onBlur={() => flavourText.trim() && addFlavour(flavourText)}
              placeholder={flavours.length ? "Add another…" : "Type a flavour and press Enter"}
              className="min-w-40 flex-1 bg-transparent px-2 py-1 text-foreground outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_FLAVOURS.filter((s) => !flavours.includes(s)).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => addFlavour(s)}
                className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-accent hover:text-accent"
              >
                + {s}
              </button>
            ))}
          </div>
        </section>

        {/* 5. stock */}
        <section className="space-y-3">
          <h3 className="font-display text-lg font-bold uppercase">
            5. <span className="text-accent">Stock</span> &amp; visibility
          </h3>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              checked={trackStock}
              onChange={(e) => setTrackStock(e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            Count how many I have
          </label>
          {trackStock && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStock(Math.max(0, stock - 1))}
                className="h-10 w-10 rounded-lg border border-line bg-white text-lg font-bold hover:border-accent hover:text-accent"
                aria-label="One less"
              >
                −
              </button>
              <input
                aria-label="Units in stock"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(Math.max(0, Math.floor(Number(e.target.value.replace(/\D/g, "")) || 0)))}
                className={`${fieldBase} w-24 text-center`}
              />
              <button
                type="button"
                onClick={() => setStock(stock + 1)}
                className="h-10 w-10 rounded-lg border border-line bg-white text-lg font-bold hover:border-accent hover:text-accent"
                aria-label="One more"
              >
                +
              </button>
              {[5, 10, 25].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setStock(stock + n)}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:border-accent hover:text-accent"
                >
                  +{n}
                </button>
              ))}
              <span className="text-sm text-muted">{stock === 0 ? "Will show “Out of stock”" : `${stock} units`}</span>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <input
              type="checkbox"
              name="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 accent-red-600"
            />
            Show this product on the website
          </label>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending || imageBusy}
            className="rounded-full bg-accent px-8 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : editing ? "Save changes" : "Add product"}
          </button>
          {state.error && (
            <span role="alert" className="text-sm text-accent-dark">
              {state.error}
            </span>
          )}
          {state.ok && editing && state.message && (
            <span className="text-sm text-green-600">
              {state.message}{" "}
              {state.id !== undefined && (
                <Link href={`/products/${state.id}`} className="font-semibold underline">
                  View on shop
                </Link>
              )}
            </span>
          )}
        </div>
      </div>

      {/* live preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 text-sm font-semibold text-muted">Live preview, as customers see it</p>
        <div className="pointer-events-none select-none" aria-hidden>
          <ProductCard product={preview} />
        </div>
        <p className="mt-2 text-xs text-muted">
          {sizesOn && cleanSizes.length === 0 && "Fill in a size and price to see it here."}
        </p>
      </aside>
    </form>
  );
}

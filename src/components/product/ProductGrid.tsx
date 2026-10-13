"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { CATEGORIES } from "@/config/site";
import { startingPrice } from "@/lib/products";
import ProductCard from "./ProductCard";

type Sort = "featured" | "price-low" | "price-high" | "name";

export default function ProductGrid({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const active = params.get("category");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = products.filter((p) => !active || p.category === active);

    if (q) {
      list = list.filter((p) =>
        [p.name, p.brand, p.category, p.description, ...(p.flavours ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (sort === "price-low") {
      list = [...list].sort((a, b) => startingPrice(a) - startingPrice(b));
    } else if (sort === "price-high") {
      list = [...list].sort((a, b) => startingPrice(b) - startingPrice(a));
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, active, query, sort]);

  const pill = (isActive: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "border-accent bg-accent text-white"
        : "border-line hover:border-accent hover:text-accent"
    }`;

  return (
    <>
      {/* search + sort */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search whey, creatine, chocolate…"
            aria-label="Search products"
            className="w-full rounded-full border border-line bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-accent"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort products"
          className="rounded-full border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      {/* categories */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/products" className={pill(!active)}>
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/products?category=${encodeURIComponent(c)}`}
            className={pill(active === c)}
          >
            {c}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted">
        {items.length} {items.length === 1 ? "product" : "products"}
        {query.trim() && <> for “{query.trim()}”</>}
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface p-8 text-center">
          <p className="font-semibold">No products found</p>
          <p className="mt-1 text-sm text-muted">
            Try a different word, or{" "}
            <button
              onClick={() => setQuery("")}
              className="font-medium text-accent hover:underline"
            >
              clear the search
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

import Link from "next/link";
import { CATEGORIES } from "@/config/site";
import { PRODUCTS } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

const TRUST = [
  ["Genuine Products", "Sourced from authorised suppliers"],
  ["Order on WhatsApp", "Quick, personal, no checkout hassle"],
  ["Fast Delivery", "We confirm your address and ship fast"],
];

export default function Home() {
  const featured = PRODUCTS.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-red-50">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
            100% Genuine Supplements
          </p>
          <h1 className="font-display text-5xl font-bold uppercase leading-tight md:text-7xl">
            Fuel Your <span className="text-accent">Gains</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Protein, creatine, pre-workout and more. Pick your products and
            order directly on WhatsApp.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 font-semibold text-white hover:opacity-90"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold uppercase">
          Shop by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/products?category=${encodeURIComponent(c)}`}
              className="rounded-xl border border-line bg-surface p-6 text-center font-semibold transition hover:border-accent hover:text-accent"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Helpful tools */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/find-supplement"
            className="rounded-xl border border-line bg-surface p-6 transition hover:border-accent"
          >
            <p className="font-display text-xl font-bold uppercase text-accent">
              Find your supplement
            </p>
            <p className="mt-2 text-sm text-muted">
              Not sure what to buy? Answer 2 questions and get picks for your
              goal and budget.
            </p>
          </Link>
          <Link
            href="/protein-calculator"
            className="rounded-xl border border-line bg-surface p-6 transition hover:border-accent"
          >
            <p className="font-display text-xl font-bold uppercase text-accent">
              Protein calculator
            </p>
            <p className="mt-2 text-sm text-muted">
              See how much protein you need every day for your weight and goal.
            </p>
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold uppercase">
            Featured <span className="text-accent">Products</span>
          </h2>
          <Link href="/products" className="text-sm text-muted hover:text-accent">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-line bg-red-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 text-center md:grid-cols-3">
          {TRUST.map(([title, text]) => (
            <div key={title}>
              <h3 className="font-display text-xl uppercase text-accent">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

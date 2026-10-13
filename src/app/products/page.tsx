import { Suspense } from "react";
import type { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse whey protein, creatine, pre-workout, mass gainers and more.",
};

async function Grid() {
  const products = await getProducts();
  return (
    <Suspense fallback={<p className="mt-8 text-muted">Loading…</p>}>
      <ProductGrid products={products} />
    </Suspense>
  );
}

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold uppercase">
        All <span className="text-accent">Products</span>
      </h1>
      <Suspense fallback={<p className="mt-8 text-muted">Loading…</p>}>
        <Grid />
      </Suspense>
    </div>
  );
}

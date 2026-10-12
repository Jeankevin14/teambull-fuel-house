import { Suspense } from "react";
import type { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse whey protein, creatine, pre-workout, mass gainers and more.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold uppercase">
        All <span className="text-accent">Products</span>
      </h1>
      <Suspense fallback={<p className="mt-8 text-muted">Loading…</p>}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}

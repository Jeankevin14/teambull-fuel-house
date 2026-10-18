import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import BarbellLoader from "@/components/fx/BarbellLoader";
import ProductGrid from "@/components/product/ProductGrid";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "Products",
  description:
    "Browse whey protein, creatine, pre-workout, mass gainers and more. Order on WhatsApp.",
  path: "/products",
});

async function Grid() {
  const products = await getProducts();
  return (
    <Suspense fallback={<BarbellLoader />}>
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
      <Suspense fallback={<BarbellLoader />}>
        <Grid />
      </Suspense>
    </div>
  );
}

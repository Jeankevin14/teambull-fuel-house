import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, findProduct } from "@/lib/catalog";
import BarbellLoader from "@/components/fx/BarbellLoader";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductImage from "@/components/product/ProductImage";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await findProduct(Number(id));
  if (!product) return {};
  return { title: product.name, description: product.description, alternates: { canonical: `/products/${product.id}` } };
}

async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await findProduct(Number(id));
  if (!product) notFound();

  return (
    <div data-stamp-scope className="mt-6 grid gap-10 md:grid-cols-2">
      <div className="overflow-hidden rounded-xl">
        <ProductImage
          product={product}
          className="h-80 md:h-96"
          letterSize="text-7xl"
        />
      </div>

      <div>
        <p className="text-sm uppercase tracking-wide text-accent">
          {product.category}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase">
          {product.name}
        </h1>
        <p className="mt-1 text-muted">by {product.brand}</p>
        <p className="mt-6 text-muted">{product.description}</p>
        <ProductPurchase product={product} />
        <p className="mt-4 text-sm text-muted">
          Final price and delivery are confirmed with you on WhatsApp.
        </p>
      </div>
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/products" className="text-sm text-muted hover:text-accent">
        ← Back to products
      </Link>
      <Suspense
        fallback={
          <BarbellLoader />
        }
      >
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

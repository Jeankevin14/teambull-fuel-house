import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getProducts, findProduct } from "@/lib/catalog";
import BarbellLoader from "@/components/fx/BarbellLoader";
import ProductPurchase from "@/components/product/ProductPurchase";
import ProductGallery from "@/components/product/ProductGallery";
import MadeInUsa from "@/components/product/MadeInUsa";
import { nutritionImageFor } from "@/data/nutrition";
import { SITE } from "@/config/site";
import type { Product } from "@/types";

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
  return pageMeta({
    title: searchTitle(product.name),
    description: searchDescription(product),
    path: `/products/${product.id}`,
    image: product.image ? { url: product.image, alt: product.name } : undefined,
  });
}

/** Google shows about 60 characters of a title. The suffix takes 11 of them, so a
 *  name longer than the rest loses its tail to an ellipsis - and the tail is the
 *  flavour. Rather than let it be cut mid-word, drop the flavour ourselves; it is
 *  still in the description, the heading and the gallery. */
function searchTitle(name: string) {
  const budget = 60 - ` | ${SITE.titleSuffix}`.length;
  if (name.length <= budget) return name;
  const dash = name.lastIndexOf(" - ");
  return dash > 0 && dash <= budget ? name.slice(0, dash) : name;
}

/** Google gives a description about 160 characters. Several catalogue entries use
 *  barely a third of that, which wastes the words a customer might search for. We
 *  add only facts already in the catalogue - brand, category and where the shop
 *  is - and never a claim about what the product does. */
function searchDescription(product: Product) {
  const desc = product.description.trim();
  if (desc.length >= 120) return desc;
  const full = `${desc} Buy ${product.brand} ${product.category.toLowerCase()} at ${SITE.name}, East Coast Road, Puducherry.`;
  if (full.length <= 160) return full;
  const short = `${desc} Available at ${SITE.name}, Puducherry.`;
  return short.length <= 160 ? short : desc;
}

/**
 * The Product + Offer block Google reads to show price and availability in the
 * search result. Every value comes from the catalogue - nothing is invented, and
 * a field we do not have is left out rather than guessed.
 */
/**
 * Breadcrumbs are what turn a plain link in a search result into
 * "teambullfuelhouse.com > Whey Protein > Enliven ...". Every URL below is a real
 * page: the home page, the category filter the grid itself links to, and this
 * product.
 */
function breadcrumbJsonLd(product: Product) {
  const abs = (path: string) => new URL(path, SITE.url).toString();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Products", item: abs("/products") },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category,
        item: abs(`/products?category=${encodeURIComponent(product.category)}`),
      },
      { "@type": "ListItem", position: 4, name: product.name },
    ],
  };
}

function productJsonLd(product: Product) {
  const inStock =
    product.inStock === false ? false : product.stock === undefined ? true : product.stock > 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    ...(product.image ? { image: new URL(product.image, SITE.url).toString() } : {}),
    offers: {
      "@type": "Offer",
      url: new URL(`/products/${product.id}`, SITE.url).toString(),
      price: String(product.price),
      priceCurrency: "INR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };
}

async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await findProduct(Number(id));
  if (!product) notFound();

  return (
    <div data-stamp-scope className="mt-6 grid gap-10 md:grid-cols-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(product)).replace(/</g, "\\u003c"),
        }}
      />
      <div>
        <ProductGallery
          product={product}
          nutritionImage={nutritionImageFor(product.image)}
        />
      </div>

      <div>
        <p className="text-sm uppercase tracking-wide text-accent">
          {product.category}
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase">
          {product.name}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-muted">
          <span>by {product.brand}</span>
          {product.madeIn === "USA" && <MadeInUsa />}
        </p>
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

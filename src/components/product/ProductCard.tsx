import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { hasOptions, isInStock, startingPrice } from "@/lib/products";
import Tilt from "@/components/fx/Tilt";
import Spotlight from "@/components/fx/Spotlight";
import { LOW_STOCK_LIMIT } from "@/config/features";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const inStock = isInStock(product);
  const options = hasOptions(product);
  const hasSizes = Boolean(product.sizes && product.sizes.length > 1);

  const low =
    inStock && product.stock !== undefined && product.stock <= LOW_STOCK_LIMIT;

  return (
    <Tilt>
      <Spotlight className="h-full rounded-xl">
      <div data-stamp-scope className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:border-accent">
        <Link href={`/products/${product.id}`} className="relative block">
          <ProductImage product={product} />
          {low && (
            <span className="anim-heartbeat absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase text-white">
              Only {product.stock} left
            </span>
          )}
          {!inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold uppercase text-white">
              Out of stock
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <p className="text-xs uppercase tracking-wide text-accent">
            {product.category}
          </p>
          <Link
            href={`/products/${product.id}`}
            className="mt-1 text-lg font-semibold hover:text-accent"
          >
            {product.name}
          </Link>
          <p className="mt-1 flex-1 text-sm text-muted">
            {product.description}
          </p>

          {(product.flavours?.length || hasSizes) && (
            <p className="mt-2 text-xs text-muted">
              {product.flavours?.length
                ? `${product.flavours.length} flavours`
                : ""}
              {product.flavours?.length && hasSizes ? " · " : ""}
              {hasSizes ? `${product.sizes!.length} sizes` : ""}
            </p>
          )}

          <p className="mt-3 text-xl font-bold">
            {hasSizes && (
              <span className="mr-1 text-sm font-normal text-muted">From</span>
            )}
            {formatPrice(startingPrice(product))}
          </p>

          {options && inStock ? (
            // needs a flavour or size first, so go to the product page
            <Link
              href={`/products/${product.id}`}
              className="mt-4 block w-full rounded-full bg-accent py-3 text-center font-semibold text-white hover:opacity-90"
            >
              Choose Options
            </Link>
          ) : (
            <AddToCartButton product={product} />
          )}
        </div>
      </div>
      </Spotlight>
    </Tilt>
  );
}

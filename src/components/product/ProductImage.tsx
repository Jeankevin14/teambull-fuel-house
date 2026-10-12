import Image from "next/image";
import type { Product } from "@/types";

/** Shows the product photo, or the category's first letter if there is no photo. */
export default function ProductImage({
  product,
  className = "h-48",
  letterSize = "text-4xl",
}: {
  product: Product;
  className?: string;
  letterSize?: string;
}) {
  return (
    <div className={`relative bg-surface ${className}`}>
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-2"
        />
      ) : (
        <div
          className={`flex h-full items-center justify-center font-display text-accent/30 ${letterSize}`}
        >
          {product.category.charAt(0)}
        </div>
      )}
    </div>
  );
}

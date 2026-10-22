import Image from "next/image";
import type { Product } from "@/types";

const SAMPLE_BY_CATEGORY: Record<string, string> = {
  "Whey Protein": "/images/sample-1.svg",
  Creatine: "/images/sample-2.svg",
  "Pre-Workout": "/images/sample-3.svg",
  "Mass Gainer": "/images/sample-4.svg",
  "BCAA & EAA": "/images/sample-5.svg",
  Vitamins: "/images/sample-6.svg",
  "Fat Burners & L-Carnitine": "/images/sample-5.svg",
  "Fish Oil": "/images/sample-6.svg",
  Wellness: "/images/sample-6.svg",
};

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
  // no photo yet? show a sample picture for the category until a real one is added
  const src = product.image || SAMPLE_BY_CATEGORY[product.category];
  // SVGs are not served through the Next image optimizer (it rejects them), and
  // uploaded photos or links can live on any address: both use a plain <img>.
  const plain = Boolean(src) && (!src.startsWith("/images/") || src.endsWith(".svg"));
  return (
    <div data-stamp-box className={`relative bg-surface ${className}`}>
      {src && plain ? (
        // photos uploaded in Admin (or links): plain <img> so any address works
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-contain p-2"
        />
      ) : src ? (
        <Image
          src={src}
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

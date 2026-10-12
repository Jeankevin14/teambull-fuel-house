import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { PRODUCTS } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/products", "/find-supplement", "/protein-calculator", "/about", "/contact", "/privacy", "/terms", "/refund-policy"];

  return [
    ...pages.map((path) => ({ url: `${SITE.url}${path}` })),
    ...PRODUCTS.map((p) => ({ url: `${SITE.url}/products/${p.id}` })),
  ];
}

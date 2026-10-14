import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = ["", "/products", "/find-supplement", "/protein-calculator", "/bmi-calculator", "/bundles", "/play", "/about", "/contact", "/privacy", "/terms", "/refund-policy"];

  return [
    ...pages.map((path) => ({ url: `${SITE.url}${path}` })),
    ...products.map((p) => ({ url: `${SITE.url}/products/${p.id}` })),
  ];
}

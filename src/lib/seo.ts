import type { Metadata } from "next";
import { SITE } from "@/config/site";

/** The picture shown when a link is shared on WhatsApp, Facebook, X and so on. */
export const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: `${SITE.name} - ${SITE.tagline}`,
};

type Img = { url: string; width?: number; height?: number; alt?: string };

/** Page metadata with matching share (Open Graph + X card) tags. */
export function pageMeta({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description?: string;
  path: string;
  image?: Img;
}): Metadata {
  const desc = description?.trim() || SITE.description;
  const full = `${title} | ${SITE.name}`;
  const img = image ?? OG_IMAGE;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      title: full,
      description: desc,
      url: path,
      siteName: SITE.name,
      type: "website",
      locale: "en_IN",
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description: desc,
      images: [img.url],
    },
  };
}

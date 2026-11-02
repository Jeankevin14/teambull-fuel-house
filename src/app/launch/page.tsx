import { Suspense } from "react";
import type { Metadata } from "next";
import CinematicLaunch from "@/components/launch/CinematicLaunch";
import { getProducts } from "@/lib/catalog";
import { CATEGORIES, SITE } from "@/config/site";
import { PEOPLE } from "@/config/people";
import { startingPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Launch",
  robots: { index: false, follow: false },
};

/** The four pillars, word for word from the About page. */
const PILLARS = [
  { word: "People", text: "Help people transform their bodies and build lasting discipline." },
  { word: "Athletes", text: "Develop athletes from first-time lifters to competition stage." },
  { word: "Brand", text: "Grow TeamBull into a recognised fitness and transformation brand." },
  { word: "Business", text: "Create a scalable business with many ways to serve the fitness community." },
];

export default function LaunchPage() {
  return (
    <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#050505" }} />}>
      <Launch />
    </Suspense>
  );
}

async function Launch() {
  const all = await getProducts();

  // the range, grouped by category and read out by name
  const range = CATEGORIES.map((category) => ({
    category,
    names: all
      .filter((p) => p.category === category)
      .slice(0, 3)
      .map((p) => p.name),
  })).filter((g) => g.names.length > 0);

  // three real lines for the cart in the shopping scene
  const cart = all.slice(0, 3).map((p) => ({ name: p.name, price: startingPrice(p) }));

  return (
    <CinematicLaunch
      data={{
        range,
        cart,
        productCount: all.length,
        categories: [...CATEGORIES],
        people: PEOPLE,
        pillars: PILLARS,
        url: SITE.url.replace(/^https?:\/\//, ""),
      }}
    />
  );
}

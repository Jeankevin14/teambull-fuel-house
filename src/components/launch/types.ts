import type { Person } from "@/config/people";

/** One pack as the trailer shows it. Everything comes from the real catalogue. */
export type LaunchProduct = {
  name: string;
  brand: string;
  category: string;
  image: string;
  flavour?: string;
  price: number;
  mrp?: number;
};

/** Everything the experience is allowed to say, gathered on the server. */
export type LaunchData = {
  /** the range, read out by category instead of shown as photographs */
  range: { category: string; names: string[] }[];
  /** a few real lines for the shopping scene */
  cart: { name: string; price: number }[];
  productCount: number;
  categories: string[];
  people: Person[];
  /** the four pillars written on the About page */
  pillars: { word: string; text: string }[];
  /** the site's own address, shown on the final card */
  url: string;
};

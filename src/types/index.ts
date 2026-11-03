import type { Category } from "@/config/site";

export type ProductSize = {
  label: string; // e.g. "2kg"
  price: number; // price for this size, in rupees
};

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: Category;
  price: number; // price in rupees (number only). If `sizes` is set, the first size's price is used as the default.
  mrp?: number; // the MRP printed on the pack. Leave out when there is none, or when it equals our price.
  description: string;
  image?: string; // e.g. "/images/whey-2kg.jpg" (file inside public/images)
  flavours?: string[]; // e.g. ["Chocolate", "Vanilla"]
  sizes?: ProductSize[]; // e.g. [{ label: "1kg", price: 1999 }, { label: "2kg", price: 3499 }]
  inStock?: boolean; // set to false to show "Out of stock"
  stock?: number; // units left (comes from the Google Sheet). Blank = not tracked
  madeIn?: "USA"; // shows a MADE IN USA badge. Only set it where the pack says so.
  awaitingPhotos?: boolean; // sold now, pack photo and nutrition label still to come
};

export type CartItem = {
  key: string; // unique per product + flavour + size
  id: number;
  name: string;
  variant?: string; // e.g. "Chocolate · 2kg"
  price: number;
  qty: number;
  max?: number; // units in stock; the cart never goes above this
  image?: string;
};

export type Me = {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
};

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
  description: string;
  image?: string; // e.g. "/images/whey-2kg.jpg" (file inside public/images)
  flavours?: string[]; // e.g. ["Chocolate", "Vanilla"]
  sizes?: ProductSize[]; // e.g. [{ label: "1kg", price: 1999 }, { label: "2kg", price: 3499 }]
  inStock?: boolean; // set to false to show "Out of stock"
};

export type CartItem = {
  key: string; // unique per product + flavour + size
  id: number;
  name: string;
  variant?: string; // e.g. "Chocolate · 2kg"
  price: number;
  qty: number;
  image?: string;
};

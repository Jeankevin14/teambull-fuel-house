import type { Product } from "@/types";

// ============================================================
//  YOUR PRODUCT LIST — add, edit or delete products here
//  Rules:
//   • every product needs a unique `id`
//   • `category` must match a name in src/config/site.ts
//   • `price` is a number only (no ₹ sign)
//   • `image` is optional: put the file in public/images
//   • `flavours` is optional:  flavours: ["Chocolate", "Vanilla"],
//   • `sizes` is optional (each size has its own price):
//        sizes: [{ label: "1kg", price: 1999 }, { label: "2kg", price: 3499 }],
//   • to mark a product as sold out add:  inStock: false,
// ============================================================

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Whey Protein",
    brand: "Brand Name",
    category: "Whey Protein",
    price: 1999,
    description: "24g protein per scoop. Fast absorbing, great for recovery.",
    flavours: ["Chocolate", "Vanilla", "Strawberry"],
    sizes: [
      { label: "1kg", price: 1999 },
      { label: "2kg", price: 3499 },
    ],
  },
  {
    id: 2,
    name: "Creatine Monohydrate",
    brand: "Brand Name",
    category: "Creatine",
    price: 499,
    description: "Pure creatine monohydrate for strength and power.",
    sizes: [
      { label: "100g", price: 499 },
      { label: "250g", price: 800 },
    ],
  },
  {
    id: 3,
    name: "Pre-Workout 300g",
    brand: "Brand Name",
    category: "Pre-Workout",
    price: 1499,
    description: "Energy and focus for your heaviest sessions.",
    flavours: ["Fruit Punch", "Blue Raspberry"],
  },
  {
    id: 4,
    name: "Mass Gainer",
    brand: "Brand Name",
    category: "Mass Gainer",
    price: 999,
    description: "High calorie formula to support lean bulking.",
    flavours: ["Chocolate", "Banana"],
    sizes: [
      { label: "1kg", price: 999 },
      { label: "3kg", price: 2799 },
    ],
  },
  {
    id: 5,
    name: "BCAA 250g",
    brand: "Brand Name",
    category: "BCAA & EAA",
    price: 1199,
    description: "Supports recovery and helps reduce muscle soreness.",
    flavours: ["Watermelon", "Orange"],
  },
  {
    id: 6,
    name: "Multivitamin 60 Tablets",
    brand: "Brand Name",
    category: "Vitamins",
    price: 599,
    description: "Daily vitamins and minerals for overall health.",
  },
];

export function getProduct(id: number) {
  return PRODUCTS.find((p) => p.id === id);
}

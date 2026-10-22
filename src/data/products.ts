import type { Product } from "@/types";

// ============================================================
//  BUILT-IN PRODUCT LIST (used only if the Google Sheet is not set up or cannot be read)
//  The live shop reads the "Products" tab of your Google Sheet.
//  Rules:
//   • every product needs a unique `id`
//   • `category` must match a name in src/config/site.ts
//   • `price` is a number only (no ₹ sign). Prices below are ESTIMATES: check and change them. Price 0 = hidden from the shop.
//   • `stock` is the number of units in hand
//   • `image` is optional: put the file in public/images
//   • `flavours` / `sizes` are optional:
//        flavours: ["Chocolate", "Vanilla"],
//        sizes: [{ label: "1kg", price: 1999 }, { label: "2kg", price: 3499 }],
// ============================================================

export const PRODUCTS: Product[] = [
  { id: 1, image: "/images/product-1.svg", name: "Apex Whey Protein", brand: "Apex", category: "Whey Protein", price: 2799, description: "Apex whey protein to support muscle recovery and your daily protein intake.", stock: 3 },
  { id: 2, image: "/images/product-2.svg", name: "BPI Sports Whey Protein", brand: "BPI Sports", category: "Whey Protein", price: 2699, description: "BPI Sports whey protein to support muscle recovery and your daily protein intake.", stock: 3 },
  { id: 3, image: "/images/product-3.svg", name: "Gibbon Whey Protein", brand: "Gibbon", category: "Whey Protein", price: 2150, description: "Gibbon whey protein to support muscle recovery and your daily protein intake.", stock: 3 },
  { id: 4, image: "/images/product-4.svg", name: "BSN Syntha-6 Whey Protein", brand: "BSN", category: "Whey Protein", price: 4499, description: "BSN whey protein to support muscle recovery and your daily protein intake.", stock: 3 },
  { id: 5, image: "/images/product-5.svg", name: "Hyper Nation Pre-Workout (100 servings)", brand: "Hyper Nation", category: "Pre-Workout", price: 3499, description: "Hyper Nation pre-workout for energy and focus before training.", stock: 3 },
  { id: 6, image: "/images/product-6.svg", name: "Psychotic Pre-Workout (New)", brand: "Insane Labz", category: "Pre-Workout", price: 2199, description: "Insane Labz pre-workout for energy and focus before training.", stock: 3 },
  { id: 7, image: "/images/product-7.svg", name: "N.O.-Xplode Pre-Workout", brand: "BSN", category: "Pre-Workout", price: 3799, description: "BSN pre-workout for energy and focus before training.", stock: 3 },
  { id: 8, image: "/images/product-8.svg", name: "C4 Pre-Workout", brand: "Cellucor", category: "Pre-Workout", price: 2799, description: "Cellucor pre-workout for energy and focus before training.", stock: 3 },
  { id: 9, image: "/images/product-9.svg", name: "Niox Pre-Workout", brand: "Niox", category: "Pre-Workout", price: 2499, description: "Niox pre-workout for energy and focus before training.", stock: 3 },
  { id: 10, image: "/images/product-10.svg", name: "Gibbon Mass Gainer", brand: "Gibbon", category: "Mass Gainer", price: 2799, description: "Gibbon mass gainer to help you add calories and gain weight.", stock: 3 },
  { id: 11, image: "/images/product-11.svg", name: "Big Flex Mass Gainer", brand: "Big Flex", category: "Mass Gainer", price: 2999, description: "Big Flex mass gainer to help you add calories and gain weight.", stock: 3 },
  { id: 12, image: "/images/product-12.svg", name: "Labrada Mass Gainer", brand: "Labrada", category: "Mass Gainer", price: 3899, description: "Labrada mass gainer to help you add calories and gain weight.", stock: 3 },
  { id: 13, image: "/images/product-13.svg", name: "Black Spider Fat Burner", brand: "Black Spider", category: "Fat Burners & L-Carnitine", price: 1699, description: "Black Spider fat burner and L-carnitine support for your training and diet plan.", stock: 3 },
  { id: 14, image: "/images/product-14.svg", name: "Lipo 6 Hardcore Fat Burner", brand: "Nutrex", category: "Fat Burners & L-Carnitine", price: 2999, description: "Nutrex fat burner and L-carnitine support for your training and diet plan.", stock: 3 },
  { id: 15, image: "/images/product-15.svg", name: "RC 3000mg L-Carnitine", brand: "RC", category: "Fat Burners & L-Carnitine", price: 1299, description: "RC fat burner and L-carnitine support for your training and diet plan.", stock: 3 },
  { id: 16, image: "/images/product-16.svg", name: "EVL CLA", brand: "EVL", category: "Fat Burners & L-Carnitine", price: 2299, description: "EVL fat burner and L-carnitine support for your training and diet plan.", stock: 3 },
  { id: 17, image: "/images/product-17.svg", name: "Xtend USA BCAA", brand: "Xtend", category: "BCAA & EAA", price: 2299, description: "Xtend amino acids to support recovery during training.", stock: 3 },
  { id: 18, image: "/images/product-18.svg", name: "Hyper Nation BCAA + EAA", brand: "Hyper Nation", category: "BCAA & EAA", price: 1999, description: "Hyper Nation amino acids to support recovery during training.", stock: 3 },
  { id: 19, image: "/images/product-19.svg", name: "Optimum Nutrition Creatine", brand: "Optimum Nutrition", category: "Creatine", price: 1299, description: "Optimum Nutrition creatine for strength and power.", stock: 3 },
  { id: 20, image: "/images/product-20.svg", name: "Gibbon Creatine", brand: "Gibbon", category: "Creatine", price: 899, description: "Gibbon creatine for strength and power.", stock: 3 },
  { id: 21, image: "/images/product-21.svg", name: "Well-being Multivitamin", brand: "Well-being", category: "Vitamins", price: 799, description: "Well-being multivitamin for daily vitamin and mineral support.", stock: 4 },
  { id: 22, image: "/images/product-22.svg", name: "Hyper Nation Multivitamin", brand: "Hyper Nation", category: "Vitamins", price: 1299, description: "Hyper Nation multivitamin for daily vitamin and mineral support.", stock: 3 },
  { id: 23, image: "/images/product-23.svg", name: "BPI Sports Multivitamin", brand: "BPI Sports", category: "Vitamins", price: 1799, description: "BPI Sports multivitamin for daily vitamin and mineral support.", stock: 3 },
  { id: 24, image: "/images/product-24.svg", name: "Well-being Fish Oil", brand: "Well-being", category: "Fish Oil", price: 899, description: "Well-being fish oil (omega-3) for daily health support.", stock: 4 },
  { id: 25, image: "/images/product-25.svg", name: "1MD Fish Oil", brand: "1MD", category: "Fish Oil", price: 1199, description: "1MD fish oil (omega-3) for daily health support.", stock: 4 },
  { id: 26, image: "/images/product-26.svg", name: "Pharm Grade Fish Oil", brand: "Pharm Grade", category: "Fish Oil", price: 1499, description: "Pharm Grade fish oil (omega-3) for daily health support.", stock: 3 },
  { id: 27, image: "/images/product-27.svg", name: "1MD Milk Thistle", brand: "1MD", category: "Wellness", price: 999, description: "1MD supplement for daily wellness support.", stock: 3 },
  { id: 28, image: "/images/product-28.svg", name: "Nature's Move NAC", brand: "Nature's Move", category: "Wellness", price: 899, description: "Nature's Move supplement for daily wellness support.", stock: 3 },
  { id: 29, image: "/images/product-29.svg", name: "Well-being Bergamot", brand: "Well-being", category: "Wellness", price: 1099, description: "Well-being supplement for daily wellness support.", stock: 3 },
  { id: 30, image: "/images/product-30.svg", name: "Well-being Probiotics", brand: "Well-being", category: "Wellness", price: 999, description: "Well-being supplement for daily wellness support.", stock: 3 },
  { id: 31, image: "/images/product-31.svg", name: "Nature's Move CoQ10", brand: "Nature's Move", category: "Wellness", price: 1099, description: "Nature's Move supplement for daily wellness support.", stock: 3 },
  { id: 32, image: "/images/product-32.svg", name: "1MD ZMA+", brand: "1MD", category: "Wellness", price: 1199, description: "1MD supplement for daily wellness support.", stock: 3 },
];

export function getProduct(id: number) {
  return PRODUCTS.find((p) => p.id === id);
}

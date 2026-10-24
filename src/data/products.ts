import type { Product } from "@/types";

// ============================================================
//  BUILT-IN PRODUCT LIST (used if the Google Sheet is not set up or cannot be read)
//  The live shop reads the "Products" tab of your Google Sheet.
//  Rules:
//   • every product needs a unique `id`
//   • `category` must match a name in src/config/site.ts
//   • `price` is a number only (no ₹ sign). Prices are ESTIMATES: check them.
//   • `stock` is the number of units in hand
//   • each flavour is its own listing, so each one has its own photo and stock
//   • nutrition-label images are mapped by product id in src/data/nutrition.ts
// ============================================================

export const PRODUCTS: Product[] = [
  { id: 1, image: "/images/apex-whey-iced-espresso.webp", name: "Apex Vitals 1 Whey - Iced Espresso", brand: "Apex Vitals", category: "Whey Protein", price: 2799, description: "Grass-fed whey protein with 27 g protein per 34 g scoop. Iced Espresso flavour, 2 kg.", flavours: ["Iced Espresso"], stock: 3 },
  { id: 2, image: "/images/apex-whey-blueberry-yoghurt.webp", name: "Apex Vitals 1 Whey - Blueberry Yoghurt", brand: "Apex Vitals", category: "Whey Protein", price: 2799, description: "Grass-fed whey protein with 27 g protein per 34 g scoop. Blueberry Yoghurt flavour, 2 kg.", flavours: ["Blueberry Yoghurt"], stock: 3 },
  { id: 3, image: "/images/gibbon-whey-latte.webp", name: "Gibbon Muscle Whey - Latte", brand: "Gibbon Nutrition", category: "Whey Protein", price: 2150, description: "Whey concentrate and isolate blend, 27 g protein per 36 g scoop. Latte flavour, 2 kg, 56 servings.", flavours: ["Latte"], stock: 3 },
  { id: 4, image: "/images/gibbon-whey-strawberry-cheesecake.webp", name: "Gibbon Muscle Whey - Strawberry Cheesecake", brand: "Gibbon Nutrition", category: "Whey Protein", price: 2150, description: "Whey concentrate and isolate blend, 25 g protein per serving. Strawberry Cheesecake flavour, 56 servings.", flavours: ["Strawberry Cheesecake"], stock: 3 },
  { id: 5, image: "/images/syntha6-chocolate-milkshake.webp", name: "BSN Syntha-6 - Chocolate Milkshake", brand: "BSN", category: "Whey Protein", price: 4499, description: "Ultra premium protein matrix, 22 g protein per serving. Chocolate Milkshake flavour, 2.5 kg, 53 servings.", flavours: ["Chocolate Milkshake"], stock: 3 },
  { id: 6, image: "/images/healthfarm-maxwhey-malai-kulfi.webp", name: "HealthFarm MaxWhey - Malai Kulfi", brand: "HealthFarm", category: "Whey Protein", price: 2799, description: "Whey isolate and concentrate blend with added amino acids, 24 g protein per 36 g scoop. Malai Kulfi flavour.", flavours: ["Malai Kulfi"], stock: 3 },
  { id: 7, image: "/images/enliven-whey-iced-coffee.webp", name: "Enliven Classic 100% Whey - Iced Coffee", brand: "Enliven Nutrition", category: "Whey Protein", price: 2699, description: "100% whey protein with added digestive enzymes, 24 g protein per scoop. Iced Coffee flavour, 2 kg, 60 servings.", flavours: ["Iced Coffee"], stock: 3 },
  { id: 8, image: "/images/product-2.webp", name: "BPI Sports Whey Protein", brand: "BPI Sports", category: "Whey Protein", price: 2699, description: "BPI Sports whey protein to support muscle recovery and your daily protein intake.", stock: 3 },
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
  { id: 21, image: "/images/product-21.svg", name: "Well-being Multivitamin", brand: "Well-being", category: "Vitamins", price: 799, description: "Well-being multivitamin for daily vitamin and mineral support.", stock: 3 },
  { id: 22, image: "/images/product-22.svg", name: "Hyper Nation Multivitamin", brand: "Hyper Nation", category: "Vitamins", price: 1299, description: "Hyper Nation multivitamin for daily vitamin and mineral support.", stock: 3 },
  { id: 23, image: "/images/product-23.svg", name: "BPI Sports Multivitamin", brand: "BPI Sports", category: "Vitamins", price: 1799, description: "BPI Sports multivitamin for daily vitamin and mineral support.", stock: 3 },
  { id: 24, image: "/images/product-24.svg", name: "Well-being Fish Oil", brand: "Well-being", category: "Fish Oil", price: 899, description: "Well-being fish oil (omega-3) for daily health support.", stock: 3 },
  { id: 25, image: "/images/product-25.svg", name: "1MD Fish Oil", brand: "1MD", category: "Fish Oil", price: 1199, description: "1MD fish oil (omega-3) for daily health support.", stock: 3 },
  { id: 26, image: "/images/product-26.svg", name: "Pharm Grade Fish Oil", brand: "Pharm Grade", category: "Fish Oil", price: 1499, description: "Pharm Grade fish oil (omega-3) for daily health support.", stock: 3 },
  { id: 27, image: "/images/product-27.svg", name: "1MD Milk Thistle", brand: "1MD", category: "Wellness", price: 999, description: "1MD supplement for daily wellness support.", stock: 3 },
  { id: 28, image: "/images/product-28.svg", name: "Nature's Move NAC", brand: "Nature's Move", category: "Wellness", price: 899, description: "Nature's Move supplement for daily wellness support.", stock: 3 },
  { id: 29, image: "/images/product-29.svg", name: "Well-being Bergamot", brand: "Well-being", category: "Wellness", price: 1099, description: "Well-being supplement for daily wellness support.", stock: 3 },
  { id: 30, image: "/images/product-30.svg", name: "Well-being Probiotics", brand: "Well-being", category: "Wellness", price: 999, description: "Well-being supplement for daily wellness support.", stock: 3 },
  { id: 31, image: "/images/product-31.svg", name: "Nature's Move CoQ10", brand: "Nature's Move", category: "Wellness", price: 1099, description: "Nature's Move supplement for daily wellness support.", stock: 3 },
  { id: 32, image: "/images/product-32.svg", name: "1MD ZMA+", brand: "1MD", category: "Wellness", price: 1199, description: "1MD supplement for daily wellness support.", stock: 3 },
  { id: 33, image: "/images/c4-cherry-limeade.webp", name: "Cellucor C4 Original - Cherry Limeade", brand: "Cellucor", category: "Pre-Workout", price: 2799, description: "The original explosive pre-workout. Cherry Limeade flavour, 390 g, 60 servings.", flavours: ["Cherry Limeade"], stock: 3 },
  { id: 34, image: "/images/c4-strawberry-margarita.webp", name: "Cellucor C4 Original - Strawberry Margarita", brand: "Cellucor", category: "Pre-Workout", price: 2799, description: "The original explosive pre-workout. Strawberry Margarita flavour, 390 g, 60 servings.", flavours: ["Strawberry Margarita"], stock: 3 },
  { id: 35, image: "/images/noxplode-blue-raz.webp", name: "BSN N.O.-Xplode - Blue Raz", brand: "BSN", category: "Pre-Workout", price: 3799, description: "Legendary pre-workout with citrulline, beta alanine and creatine. Blue Raz flavour, 555 g, 30 servings.", flavours: ["Blue Raz"], stock: 3 },
  { id: 36, image: "/images/noxplode-fruit-punch.webp", name: "BSN N.O.-Xplode - Fruit Punch", brand: "BSN", category: "Pre-Workout", price: 3799, description: "Legendary pre-workout with citrulline, beta alanine and creatine. Fruit Punch flavour, 555 g, 30 servings.", flavours: ["Fruit Punch"], stock: 3 },
  { id: 37, image: "/images/noxplode-grape.webp", name: "BSN N.O.-Xplode - Grape", brand: "BSN", category: "Pre-Workout", price: 3799, description: "Legendary pre-workout with citrulline, beta alanine and creatine. Grape flavour, 555 g, 30 servings.", flavours: ["Grape"], stock: 3 },
  { id: 38, image: "/images/psychotic-grape.webp", name: "Insane Labz Psychotic - Grape", brand: "Insane Labz", category: "Pre-Workout", price: 2199, description: "High-stimulant pre-workout powerhouse. Grape flavour, 219 g, 35 servings.", flavours: ["Grape"], stock: 3 },
  { id: 39, image: "/images/psychotic-watermelon.webp", name: "Insane Labz Psychotic - Watermelon", brand: "Insane Labz", category: "Pre-Workout", price: 2199, description: "High-stimulant pre-workout powerhouse. Watermelon flavour, 214 g, 35 servings.", flavours: ["Watermelon"], stock: 3 },
  { id: 40, image: "/images/psychotic-blue-raspberry.webp", name: "Insane Labz Psychotic - Blue Raspberry", brand: "Insane Labz", category: "Pre-Workout", price: 2199, description: "High-stimulant pre-workout powerhouse. Blue Raspberry flavour, 220 g, 35 servings.", flavours: ["Blue Raspberry"], stock: 3 },
  { id: 41, image: "/images/everlast-devil-tropical.webp", name: "Hypper Nation Everlast - Devil Tropical", brand: "Hypper Nation", category: "Pre-Workout", price: 3499, description: "High-stim ripped formulation pre-workout, 300 mg caffeine per 5 g scoop. Devil Tropical flavour, 500 g, 100 servings.", flavours: ["Devil Tropical"], stock: 3 },
  { id: 42, image: "/images/everlast-devil-melon.webp", name: "Hypper Nation Everlast - Devil Melon", brand: "Hypper Nation", category: "Pre-Workout", price: 3499, description: "High-stim ripped formulation pre-workout, 300 mg caffeine per 5 g scoop. Devil Melon flavour, 500 g, 100 servings.", flavours: ["Devil Melon"], stock: 3 },
];

export function getProduct(id: number) {
  return PRODUCTS.find((p) => p.id === id);
}

// ============================================================
//  COMBO PACKS — edit this file to change the packs
//  Each pack picks one in-stock product from every category listed,
//  so prices always come from your Products sheet.
// ============================================================

import type { Category } from "@/config/site";

export type Bundle = {
  id: string;
  name: string;
  tagline: string;
  categories: Category[]; // one product is picked from each of these
  discount: number; // percent off the total when bought as a pack (0 = no price cut)
  perk?: string; // a free extra shown in the pack (leave out for none)
};

export const BUNDLES: Bundle[] = [
  {
    id: "muscle-starter",
    name: "Muscle Starter Pack",
    tagline: "Protein and creatine to start building",
    categories: ["Whey Protein", "Creatine"],
    discount: 0,
  },
  {
    id: "fat-loss",
    name: "Fat Loss Kit",
    tagline: "Train harder, recover well, stay lean",
    categories: ["Whey Protein", "BCAA & EAA", "Pre-Workout"],
    discount: 0,
  },
  {
    id: "mass-gain",
    name: "Mass Gain Pack",
    tagline: "Calories, strength and daily health",
    categories: ["Mass Gainer", "Creatine", "Vitamins"],
    discount: 0,
  },
  {
    id: "everyday",
    name: "Everyday Fuel Pack",
    tagline: "Simple daily nutrition",
    categories: ["Whey Protein", "Vitamins"],
    discount: 0,
  },
];

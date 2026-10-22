// ============================================================
//  YOUR BUSINESS DETAILS — edit this file to change them
// ============================================================

export const SITE = {
  name: "Teambull Fuel House",
  shortName: "TFH",
  tagline: "Fuel Your Gains",
  description:
    "Buy genuine gym supplements: whey protein, creatine, pre-workout and more. Order easily on WhatsApp.",
  url: "https://www.teambullfuelhouse.com",

  // WhatsApp number: country code + number, digits only (no +, no spaces)
  whatsapp: "917548854038",

  instagram: "https://instagram.com/teambull.offi",
  email: "teambull2002@gmail.com",
  address: "No: 4-5, 1st Floor, East Coast Rd, Kottupalayam, Puducherry, 605008",
  fssai: "", // Add your FSSAI number here once you have it (shown in footer)

  year: 2026,
};

// Categories shown on the home page and as filters on the Products page.
// A product's `category` must match one of these names exactly.
export const CATEGORIES = [
  "Whey Protein",
  "Pre-Workout",
  "Mass Gainer",
  "Fat Burners & L-Carnitine",
  "BCAA & EAA",
  "Creatine",
  "Vitamins",
  "Fish Oil",
  "Wellness",
] as const;

export type Category = (typeof CATEGORIES)[number];

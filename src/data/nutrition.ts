// Nutrition / supplement-facts label for each flavour, photographed from the pack.
//
// Keyed by the product's own photo, NOT by its id. Ids can be reassigned when the
// catalogue is reloaded into the Google Sheet, and a mismatched label is worse than
// no label at all. Keying by photo means a product can only ever show the label that
// belongs to the exact pack in its picture.
const BY_IMAGE: Record<string, string> = {
  "apex-whey-iced-espresso": "apex-whey-iced-espresso-nutrition",
  "apex-whey-blueberry-yoghurt": "apex-whey-blueberry-yoghurt-nutrition",
  "gibbon-whey-latte": "gibbon-whey-latte-nutrition",
  "gibbon-whey-strawberry-cheesecake": "gibbon-whey-strawberry-cheesecake-nutrition",
  "syntha6-chocolate-milkshake": "syntha6-chocolate-milkshake-nutrition",
  "healthfarm-maxwhey-malai-kulfi": "healthfarm-maxwhey-malai-kulfi-nutrition",
  "enliven-whey-iced-coffee": "enliven-whey-iced-coffee-nutrition",
  "c4-cherry-limeade": "c4-cherry-limeade-nutrition",
  "c4-strawberry-margarita": "c4-strawberry-margarita-nutrition",
  "noxplode-blue-raz": "noxplode-blue-raz-nutrition",
  "noxplode-fruit-punch": "noxplode-fruit-punch-nutrition",
  "noxplode-grape": "noxplode-grape-nutrition",
  "psychotic-grape": "psychotic-grape-nutrition",
  "psychotic-watermelon": "psychotic-watermelon-nutrition",
  "psychotic-blue-raspberry": "psychotic-blue-raspberry-nutrition",
  "everlast-devil-tropical": "everlast-devil-tropical-nutrition",
  "everlast-devil-melon": "everlast-devil-melon-nutrition",
  "hypper-eaa-bcaa-ice-blue-quantum": "hypper-eaa-bcaa-ice-blue-quantum-nutrition",
  "hypper-eaa-bcaa-mango-magic": "hypper-eaa-bcaa-mango-magic-nutrition",
  "gibbon-mass-gainer-swiss-chocolate": "gibbon-mass-gainer-swiss-chocolate-nutrition",
  "bigflex-king-mammoth-chocolate-cookies": "bigflex-king-mammoth-chocolate-cookies-nutrition",
  "labrada-mass-gainer-chocolate": "labrada-mass-gainer-chocolate-nutrition",
  "labrada-mass-gainer-mocha": "labrada-mass-gainer-mocha-nutrition",
  "xtend-bcaa-mango-madness": "xtend-bcaa-mango-madness-nutrition",
  "xtend-bcaa-watermelon-explosion": "xtend-bcaa-watermelon-explosion-nutrition",
  "xtend-bcaa-italian-blood-orange": "xtend-bcaa-italian-blood-orange-nutrition",
};

/**
 * The nutrition slide for a product, or undefined when we have no authentic label.
 * A product with no label simply shows a single-slide gallery.
 */
export function nutritionImageFor(image?: string): string | undefined {
  if (!image) return undefined;
  const slug = image.replace(/^\/images\//, "").replace(/\.[a-z0-9]+$/i, "");
  const hit = BY_IMAGE[slug];
  return hit ? `/images/${hit}.webp` : undefined;
}

/**
 * Flavours whose second slide is the brand's marketing panel (brand, flavour, size,
 * on-pack claims) rather than a full nutrition table. Flagged for review so the real
 * label can replace it; no values have been invented for these.
 */
export const NUTRITION_NEEDS_REVIEW = [
  "syntha6-chocolate-milkshake",
  "enliven-whey-iced-coffee",
  "gibbon-whey-strawberry-cheesecake",
  "psychotic-watermelon",
];

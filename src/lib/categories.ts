// Main categories for requests (Consolidated Global List)
export const MAIN_CATEGORIES = [
  "Tech",
  "Collectibles",
  "Home & Living",
  "Fashion",
  "Sports",
  "Services",
  "Gaming",
  "Auto",
  "Local",
  "Garden",
  "Office",
  "Learning",
  "Culture & Entertainment",
  "Grocery",
  "Health",
  "Travel",
  "Property",
  "Experiences",
  "Beauty",
  "Digital",
] as const;

export type MainCategory = typeof MAIN_CATEGORIES[number];

// Subcategories for each main category
export const SUBCATEGORIES: Record<MainCategory, string[]> = {
  "Tech": [],
  "Collectibles": [],
  "Home & Living": [],
  "Fashion": [],
  "Sports": [],
  "Services": [],
  "Gaming": [],
  "Auto": [],
  "Local": [],
  "Garden": [],
  "Office": [],
  "Learning": [],
  "Culture & Entertainment": [],
  "Grocery": [],
  "Health": [],
  "Travel": [],
  "Property": [],
  "Experiences": [],
  "Beauty": [],
  "Digital": [],
};

// All categories (main + subcategories) for filtering
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  ...Object.values(SUBCATEGORIES).flat(),
] as const;

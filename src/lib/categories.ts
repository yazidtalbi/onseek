// Main categories for requests (Consolidated Global List)
export const MAIN_CATEGORIES = [
  "Fashion",
  "Tech",
  "Gaming",
  "Services",
  "Travel",
  "Property",
  "Experiences",
  "Learning",
  "Home",
  "Beauty",
  "Artisanat",
  "Automotive",
  "Family",
  "Health",
  "Grocery",
  "Pets",
  "Digital",
  "Culture",
  "Sports",
  "Finance",
] as const;

export type MainCategory = typeof MAIN_CATEGORIES[number];

// Subcategories for each main category
export const SUBCATEGORIES: Record<MainCategory, string[]> = {
  "Fashion": [],
  "Tech": [],
  "Gaming": [],
  "Services": [],
  "Travel": [],
  "Property": [],
  "Experiences": [],
  "Learning": [],
  "Home": [],
  "Beauty": [],
  "Artisanat": [],
  "Automotive": [],
  "Family": [],
  "Health": [],
  "Grocery": [],
  "Pets": [],
  "Digital": [],
  "Culture": [],
  "Sports": [],
  "Finance": [],
};

// All categories (main + subcategories) for filtering
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  ...Object.values(SUBCATEGORIES).flat(),
] as const;

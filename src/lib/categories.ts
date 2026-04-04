// Main categories for requests (Consolidated Global List)
export const MAIN_CATEGORIES = [
  "Tech & Electronics",
  "Grocery & Food",
  "Fashion & Accessories",
  "Health & Beauty",
  "Family & Kids",
  "Home & Living",
  "Garden & DIY",
  "Automotive",
  "Culture & Entertainment",
  "Sports & Outdoors",
  "Mobile & Internet Plans",
  "Finance & Insurance",
  "Services",
  "Travel",
  "Gaming & Consoles",
] as const;

export type MainCategory = typeof MAIN_CATEGORIES[number];

// Subcategories for each main category
export const SUBCATEGORIES: Record<MainCategory, string[]> = {
  "Tech & Electronics": [],
  "Grocery & Food": [],
  "Fashion & Accessories": [],
  "Health & Beauty": [],
  "Family & Kids": [],
  "Home & Living": [],
  "Garden & DIY": [],
  "Automotive": [],
  "Culture & Entertainment": [],
  "Sports & Outdoors": [],
  "Mobile & Internet Plans": [],
  "Finance & Insurance": [],
  "Services": [],
  "Travel": [],
  "Gaming & Consoles": [],
};

// All categories (main + subcategories) for filtering
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  ...Object.values(SUBCATEGORIES).flat(),
] as const;

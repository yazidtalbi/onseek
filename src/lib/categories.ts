// Main categories for requests
export const MAIN_CATEGORIES = [
  "Tech",
  "Gaming",
  "Fashion",
  "Health & Cosmetics",
  "Family & Children",
  "Home & Living",
  "Garden & DIY",
  "Auto",
  "Grocery",
] as const;

export type MainCategory = typeof MAIN_CATEGORIES[number];

// Subcategories for each main category
export const SUBCATEGORIES: Record<MainCategory, string[]> = {
  "Tech": [
    "Telephony",
    "Photography",
    "Computing",
    "Home Automation",
    "Wearables",
    "Connected Objects",
    "Audio & Hi-fi",
    "Electronic Accessories",
    "Apps & Software",
    "TV & Video",
  ],
  "Gaming": [
    "PC Gaming",
    "Video Games",
    "Consoles",
    "Gaming Accessories",
  ],
  "Fashion": [
    "Shoes",
    "Fashion",
    "Sportswear",
    "Fashion Accessories",
  ],
  "Health & Cosmetics": [
    "Perfumes",
    "Beauty",
    "Pharmacy & Parapharmacy",
    "Hygiene & Care",
  ],
  "Family & Children": [
    "Childcare",
    "School Supplies",
    "Games & Toys",
    "Pregnancy & Maternity",
  ],
  "Home & Living": [
    "Lighting",
    "Decoration",
    "Home Appliances",
    "Furniture",
    "Stationery & Office",
    "Culinary Arts",
    "Kitchen & Maintenance",
  ],
  "Garden & DIY": [
    "Garden",
    "Tools",
    "Works & Materials",
  ],
  "Auto": [
    "Fuel",
    "Tires",
    "Car Parts",
    "Car Leasing",
    "Motorcycle Accessories",
    "Car Accessories",
    "Cars & Motorcycles",
    "Car Service & Repair",
  ],
  "Grocery": [
    "Food",
    "Animals",
    "Drinks",
    "Home Hygiene",
  ],
};

// All categories (main + subcategories) for filtering
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  ...Object.values(SUBCATEGORIES).flat(),
] as const;


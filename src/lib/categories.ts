// Main categories for requests (Consolidated Global List)
export const MAIN_CATEGORIES = [
  "Tech",
  "Fashion",
  "Home",
  "Auto",
  "Hobbies",
  "Health",
  "Kids",
  "Garden",
  "Services",
  "Other",
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
    "Audio & Hi-fi",
    "TV & Video",
    "Gaming Consoles",
    "Apps & Software",
  ],
  "Fashion": [
    "Clothing",
    "Shoes",
    "Fashion Accessories",
    "Watches",
    "Jewelry",
    "Bags & Luggage",
    "Sportswear",
  ],
  "Home": [
    "Furniture",
    "Decoration",
    "Appliances",
    "Culinary Arts",
    "Bedding",
    "Lighting",
    "Stationery & Office",
  ],
  "Auto": [
    "Cars",
    "Motorcycles",
    "Bicycles",
    "Car Parts",
    "Auto Accessories",
    "Service & Repair",
    "Tires",
  ],
  "Hobbies": [
    "Sports & Fitness",
    "Music & Instruments",
    "Books & Media",
    "Board Games",
    "Artwork & Collectibles",
    "Camping & Outdoors",
    "Gaming Accessories",
  ],
  "Health": [
    "Skincare & Beauty",
    "Perfumes",
    "Makeup",
    "Wellness & Pharmacy",
    "Hygiene",
  ],
  "Kids": [
    "Toys",
    "Childcare",
    "Baby Gear",
    "School Supplies",
    "Maternity",
  ],
  "Garden": [
    "Gardening",
    "DIY Tools",
    "Home Improvement",
    "Materials",
  ],
  "Services": [
    "Freelance & Pro",
    "Lessons & Tutoring",
    "Events & Catering",
    "Cleaning & Maintenance",
  ],
  "Other": [],
};

// All categories (main + subcategories) for filtering
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  ...Object.values(SUBCATEGORIES).flat(),
] as const;


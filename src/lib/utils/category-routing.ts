import { MAIN_CATEGORIES } from "@/lib/categories";

export const MODE_MAP: Record<string, string> = {
  popular: "trending",
  latest: "latest",
  "for-you": "for_you",
};

export const REVERSE_MODE_MAP: Record<string, string> = {
  trending: "popular",
  latest: "latest",
  for_you: "for-you",
};

export function getCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/ & /g, "-")
    .replace(/\//g, "-")
    .replace(/ /g, "-");
}

export function getCategoryName(slug: string): string | null {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase();
  if (normalizedSlug === "all") return "Discover";
  return MAIN_CATEGORIES.find(cat => getCategorySlug(cat) === normalizedSlug) || null;
}

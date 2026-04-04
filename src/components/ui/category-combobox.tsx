"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAIN_CATEGORIES, SUBCATEGORIES } from "@/lib/categories";
import {
  Check,
  X
} from "lucide-react";

// Flatten all subcategories from the catalog and map them to their main categories
const SEARCH_DATABASE = Object.entries(SUBCATEGORIES).flatMap(([main, subs]) =>
  subs.map(sub => ({ label: sub, parent: main }))
);

// Map common brands/keywords to categories
const BRAND_MAPPING = [
  { keywords: ["mercedes", "benz", "merc", "bmw", "audi", "tesla"], parent: "Automotive" },
  { keywords: ["iphone", "apple", "smartphone", "phone", "samsung", "pixel"], parent: "Tech & Electronics" },
  { keywords: ["macbook", "laptop", "pc", "computer", "dell", "hp"], parent: "Tech & Electronics" },
  { keywords: ["rolex", "watch", "omega", "cartier"], parent: "Fashion & Accessories" },
  { keywords: ["nike", "jordan", "shoes", "sneakers", "adidas"], parent: "Fashion & Accessories" },
  { keywords: ["sony", "canon", "camera", "nikon"], parent: "Tech & Electronics" },
  { keywords: ["gamer", "ps5", "xbox", "nintendo"], parent: "Gaming & Consoles" },
];

export function CategoryCombobox({
  title,
  category,
  onTitleChange,
  onCategoryChange,
  placeholder = "e.g. Mercedes-Benz, iPhone 15, Rolex...",
  className,
}: {
  title: string;
  category: string;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Suggest categories based on title
  const suggestions = React.useMemo(() => {
    if (!title || title.length < 2) return [];
    const lowerTitle = title.toLowerCase();

    const matches = new Set<string>();

    // 1. Check brand mapping
    BRAND_MAPPING.forEach(bm => {
      if (bm.keywords.some(k => lowerTitle.includes(k))) {
        matches.add(bm.parent);
      }
    });

    // 2. Check search database
    SEARCH_DATABASE.forEach(item => {
      if (item.label.toLowerCase().includes(lowerTitle)) {
        matches.add(item.parent);
      }
    });

    // 3. Fallback to main categories if any match
    MAIN_CATEGORIES.forEach(cat => {
      if (cat.toLowerCase().includes(lowerTitle)) {
        matches.add(cat);
      }
    });

    return Array.from(matches).slice(0, 4);
  }, [title]);

  const hasSuggestions = suggestions.length > 0;

  return (
    <div className={cn("w-full space-y-6 pt-2", className)}>
      {/* Primary Input (Name) */}
      <div className="relative group p-1 -m-1">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          autoFocus={true}
          className={cn(
            "px-6 h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] text-base font-semibold transition-all shadow-none",
            "hover:border-gray-300 focus:border-[#222234] placeholder:text-gray-400 placeholder:font-normal"
          )}
        />
        {title && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onTitleChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </div>

      {/* Reactive Category Suggestions */}
      {title.length >= 3 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700 ease-out fill-mode-both">
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-150 fill-mode-both">
              <h3 className="text-sm font-medium text-gray-500">
                Which category fits best your item?
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-700 ease-out delay-200 fill-mode-both">
              {Array.from(MAIN_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 active:scale-95 text-xs font-semibold",
                    category === cat
                      ? "bg-[#222234] border-[#222234] text-white shadow-md shadow-[#222234]/10"
                      : "bg-white border-[#e5e7eb] text-gray-500 hover:border-[#222234] hover:text-[#222234] hover:bg-gray-50"
                  )}
                >
                  {cat}
                  {category === cat && <Check className="h-3.5 w-3.5 text-green-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft, ListFilter } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { FiltersModal } from "@/components/requests/filters-modal";
import { getCategorySlug, getCategoryName, REVERSE_MODE_MAP } from "@/lib/utils/category-routing";
import type { FeedMode } from "@/lib/types";
import { useAuth } from "@/components/layout/auth-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { Rows3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoryPills({
  mode = "for_you",
  hasPreferences = false,
  viewMode,
  onViewModeChange,
  hideViewToggle = false,
  hideFilters = false
}: {
  mode?: FeedMode;
  hasPreferences?: boolean;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  hideViewToggle?: boolean;
  hideFilters?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = React.useState(true);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = React.useState(false);

  // Detect selected category from pathname or search params
  const pathParts = pathname.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  const isCategoryInPath = pathname.includes('/popular/') || pathname.includes('/latest/') || pathname.includes('/for-you/');
  const pathCategory = isCategoryInPath ? getCategoryName(lastPart) : null;
  const isHomePage = pathname === "/";
  const isForYouPage = pathname.includes("/for-you");
  const isSavedPage = pathname.includes("/saved");

  let selectedCategory = isHomePage ? "Discover" : (pathCategory || searchParams.get("category") || "Discover");
  if (isForYouPage) selectedCategory = "For You";
  if (isSavedPage) selectedCategory = "My saves";

  const handleModeChange = (newMode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const modePath = REVERSE_MODE_MAP[newMode as FeedMode] || "latest";

    // Maintain current category slug if present
    const pathParts = pathname.split('/');
    const lastPart = pathParts.pop();
    const isCategoryPath = pathname.includes('/popular/') || pathname.includes('/latest/');
    
    // Ignore words that are path roots like 'for-you', 'popular', 'latest'
    const isSpecialRoot = lastPart === 'for-you' || lastPart === 'popular' || lastPart === 'latest';

    if (isCategoryPath && lastPart && !isSpecialRoot) {
      router.push(`/${modePath}/${lastPart}?${params.toString()}`);
    } else {
      router.push(`/${modePath}?${params.toString()}`);
    }
  };

  // Check scroll position for categories
  React.useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollCategoriesRight(scrollLeft < scrollWidth - clientWidth - 10);
        setCanScrollCategoriesLeft(scrollLeft > 10);
      }
    };

    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      }
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (category === "Discover") {
      router.push("/" + (params.toString() ? `?${params.toString()}` : ""));
      return;
    }

    if (category === "For You") {
      router.push("/for-you" + (params.toString() ? `?${params.toString()}` : ""));
      return;
    }

    if (category === "My saves") {
      router.push("/saved");
      return;
    }

    const modePath = mode === "for_you" ? "latest" : (REVERSE_MODE_MAP[mode] || "latest");

    if (category === "All") {
      router.push(`/${modePath}?${params.toString()}`);
    } else {
      const slug = getCategorySlug(category);
      router.push(`/${modePath}/${slug}?${params.toString()}`);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const priceMax = searchParams.get("priceMax") || "";
  const country = searchParams.get("country") || "";
  const categories = ["Discover", ...(user ? ["For You", "My saves"] : []), ...MAIN_CATEGORIES];
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const hasActiveFilters = searchParams.get("priceMin") || searchParams.get("priceMax") || searchParams.get("country");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "Discover" || value === "" || value === "0") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key === "category") params.delete("page");
    const hasQuery = searchParams.get("q");
    const path = hasQuery ? "/search" : pathname;
    router.push(`${path}?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between w-full">
        {/* Categories Scroller - far left */}
        <div className="flex-1 min-w-0 pr-4 flex items-center relative group">
          {/* Left gradient overlay */}
          {canScrollCategoriesLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
          )}

          {/* Left chevron button */}
          {canScrollCategoriesLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 hover:bg-gray-100 transition-all z-20"
            >
              <ChevronLeft className="h-3 w-3 text-gray-600" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth w-full px-2 justify-start"
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "px-4 py-2 text-[15px] whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-gray-100 text-black rounded-full font-bold"
                      : "bg-transparent text-gray-400 hover:text-gray-600 font-medium"
                  )}
                >
                  {category.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Right gradient overlay */}
          {canScrollCategoriesRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
          )}

          {/* Right chevron button */}
          {canScrollCategoriesRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 hover:bg-gray-100 transition-all z-20"
            >
              <ChevronRight className="h-3 w-3 text-gray-600" />
            </button>
          )}
        </div>

        {/* Far Right Nav - View, Sort, Filter */}
        {!hideFilters && (
          <div className="shrink-0 flex items-center gap-2">
            {/* Filter Button */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "w-9 h-9 p-0 flex items-center justify-center rounded-full text-sm font-medium transition-colors border",
                hasActiveFilters || filtersOpen
                  ? "bg-gray-100 text-gray-900 border-gray-300"
                  : "bg-white border-transparent text-gray-600 hover:text-gray-900"
              )}
              title="Filters"
            >
              <ListFilter className="h-4 w-4" />
            </button>

            {/* Sort (Latest) */}
            <Select value={mode === "for_you" ? "latest" : mode} onValueChange={handleModeChange}>
              <SelectTrigger className="px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 border-transparent bg-white text-gray-600 hover:text-gray-900 h-9 shadow-none focus:ring-0 w-auto">
                <span className="truncate">
                  {mode === "trending" ? "Trending" : "Latest"}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-white min-w-[150px]">
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            {!hideViewToggle && viewMode !== undefined && onViewModeChange && (
              <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className={cn("h-7 w-7 p-0 rounded-full", viewMode === "list" ? "bg-white text-gray-900" : "bg-transparent text-gray-500 hover:text-gray-900")}
                  title="List view"
                >
                  <Rows3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className={cn("h-7 w-7 p-0 rounded-full", viewMode === "grid" ? "bg-white text-gray-900" : "bg-transparent text-gray-500 hover:text-gray-900")}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Inline Filters */}
      {filtersOpen && (
        <div className="w-full flex items-center justify-end gap-6 p-4 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[16px] transition-all">
          <div className="flex-1 max-w-[240px]">
            <Label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Max Budget ($)</Label>
            <Input 
              type="number" 
              placeholder="No limit" 
              value={priceMax || ""} 
              onChange={(e) => updateParam("priceMax", e.target.value)}
              className="h-10 rounded-xl bg-white"
            />
          </div>
          <div className="flex-1 max-w-[240px]">
            <Label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Country</Label>
            <CountryCombobox
              value={country}
              onChange={(val) => updateParam("country", val)}
            />
          </div>
        </div>
      )}
    </div>
  );
}


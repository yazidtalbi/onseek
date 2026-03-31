"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft, ListFilter } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { FiltersModal } from "@/components/requests/filters-modal";
import { getCategorySlug, getCategoryName, REVERSE_MODE_MAP } from "@/lib/utils/category-routing";
import type { FeedMode } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategoryPills({ 
  mode = "for_you",
  hasPreferences = false 
}: { 
  mode?: FeedMode;
  hasPreferences?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = React.useState(true);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = React.useState(false);

  // Detect selected category from pathname or search params
  const pathParts = pathname.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  const isCategoryInPath = pathname.includes('/app/popular/') || pathname.includes('/app/latest/') || pathname.includes('/app/for-you/');
  const pathCategory = isCategoryInPath ? getCategoryName(lastPart) : null;
  const isHomePage = pathname === "/app";
  
  const selectedCategory = isHomePage ? "Discover" : (pathCategory || searchParams.get("category") || "All");
  
  const handleModeChange = (newMode: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    
    const modePath = REVERSE_MODE_MAP[newMode as FeedMode] || "for-you";
    
    // Maintain current category slug if present
    const categorySlug = pathname.split('/').pop();
    const isCategoryPath = pathname.includes('/app/popular/') || pathname.includes('/app/latest/') || pathname.includes('/app/for-you/');
    
    if (isCategoryPath && categorySlug && categorySlug !== modePath) {
      router.push(`/app/${modePath}/${categorySlug}?${params.toString()}`);
    } else {
      router.push(`/app/${modePath}?${params.toString()}`);
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
      router.push("/app" + (params.toString() ? `?${params.toString()}` : ""));
      return;
    }

    const modePath = REVERSE_MODE_MAP[mode] || "for-you";
    
    if (category === "All") {
      router.push(`/app/${modePath}?${params.toString()}`);
    } else {
      const slug = getCategorySlug(category);
      router.push(`/app/${modePath}/${slug}?${params.toString()}`);
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

  const categories = ["Discover", "All", ...MAIN_CATEGORIES];
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const hasActiveFilters = searchParams.get("priceMin") || searchParams.get("priceMax") || searchParams.get("country");

  return (
    <div className="flex items-center w-full gap-3">
      {/* Mode Dropdown - Replacing Sort Dropdown */}
      <div className="flex-shrink-0">
        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-[110px] border-none shadow-none font-medium h-9 px-2 hover:bg-gray-100 rounded-full transition-colors text-black focus:ring-0">
            <div className="flex items-center gap-2">
              <span className="truncate">
                {mode === "for_you" ? "For you" : mode === "trending" ? "Trending" : "Latest"}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white min-w-[150px]">
            <SelectItem value="for_you" disabled={!hasPreferences}>For you</SelectItem>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Scroller */}
      <div className="relative flex-1 flex items-center min-w-0 group">
        {/* Left gradient overlay */}
        {canScrollCategoriesLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
        )}
        
        {/* Left chevron button (Categories) */}
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
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth w-full px-2 justify-center"
        >
          {categories.map((category) => {
            const isActive = selectedCategory === category || (selectedCategory === null && category === "All");
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
                {category}
              </button>
            );
          })}
        </div>

        {/* Right gradient overlay */}
        {canScrollCategoriesRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
        )}
        
        {/* Right chevron button (Categories) */}
        {canScrollCategoriesRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/90 hover:bg-gray-100 transition-all z-20"
          >
            <ChevronRight className="h-3 w-3 text-gray-600" />
          </button>
        )}
      </div>

      {/* Filters Button - NOW ON THE FAR RIGHT */}
      <div className="flex-shrink-0">
        <FiltersModal open={filtersOpen} onOpenChange={setFiltersOpen}>
          <button
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 border border-gray-200",
              hasActiveFilters
                ? "bg-gray-100 text-gray-900 border-gray-300"
                : "bg-white text-gray-500 hover:text-gray-700"
            )}
          >
            <ListFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </FiltersModal>
      </div>
    </div>
  );
}


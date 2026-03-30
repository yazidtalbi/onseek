"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, ListFilter } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { FiltersModal } from "@/components/requests/filters-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategoryPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = React.useState(true);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = React.useState(false);

  const selectedCategory = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "newest";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/app?${params.toString()}`);
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
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    params.delete("page");
    router.push(`/app?${params.toString()}`);
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

  const categories = ["All", ...MAIN_CATEGORIES];
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const hasActiveFilters = searchParams.get("priceMin") || searchParams.get("priceMax") || searchParams.get("country");

  return (
    <div className="flex items-center w-full gap-3">
      {/* Sort Dropdown - NOW ON THE FAR LEFT */}
      <div className="flex-shrink-0">
        <Select value={sort} onValueChange={(val) => updateParam("sort", val)}>
          <SelectTrigger className="w-[100px] border-none shadow-none font-medium h-9 px-2 hover:bg-gray-50 rounded-full transition-colors text-gray-600 focus:ring-0">
            <div className="flex items-center gap-2">
              <span className="truncate">{sort === "active" ? "Active" : "Newest"}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white min-w-[150px]">
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="active">Most active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Scroller */}
      <div className="relative flex-1 flex items-center min-w-0 group">
        {/* Left gradient overlay */}
        {canScrollCategoriesLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f5f6f9] to-transparent pointer-events-none z-10" />
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
                  "px-4 py-1.5 rounded-full text-[15px] whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-white text-black border-black border-2 font-bold px-3.5"
                    : "bg-white text-gray-500 hover:text-gray-700 border border-transparent font-semibold"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Right gradient overlay */}
        {canScrollCategoriesRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f5f6f9] to-transparent pointer-events-none z-10" />
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


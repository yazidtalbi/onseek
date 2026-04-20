"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft, ListFilter, Bookmark } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { getCategorySlug, getCategoryName, REVERSE_MODE_MAP } from "@/lib/utils/category-routing";
import type { FeedMode } from "@/lib/types";
import { useAuth } from "@/components/layout/auth-provider";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CategoryPills({
  mode = "for_you",
  leftElement
}: {
  mode?: FeedMode;
  onModeChange?: (mode: FeedMode) => void;
  hasPreferences?: boolean;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  hideViewToggle?: boolean;
  hideFilters?: boolean;
  leftElement?: React.ReactNode;
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

  const allCategories = ["Discover", ...(user ? ["For You", "My saves"] : []), ...MAIN_CATEGORIES];
  const categories = user ? allCategories : allCategories.slice(0, 7);
  const moreCategories = user ? [] : allCategories.slice(7);

  return (
    <div className="w-full flex-1 pr-4 flex items-center relative group">
      {/* Left Element (e.g. Filters button on mobile) */}
      {leftElement && (
        <div className="flex-shrink-0 pr-2">
          {leftElement}
        </div>
      )}

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
        className="flex items-center gap-0 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth w-full justify-start py-1"
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          const displayText = (category === "For You" || category === "My saves" || category === "Discover") 
            ? category 
            : category.split(' ')[0];
            
          return (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                "px-3 md:px-4 py-2 text-[15px] whitespace-nowrap transition-all duration-200 flex items-center gap-2 flex-shrink-0",
                isActive
                  ? "bg-gray-100 text-black rounded-full font-bold"
                  : "bg-transparent text-gray-400 hover:text-gray-600 font-medium"
              )}
            >
              {category === "My saves" && <Bookmark className="h-4 w-4" />}
              {displayText}
            </button>
          );
        })}

        {moreCategories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "px-4 py-2 text-[15px] whitespace-nowrap transition-all duration-200 flex items-center gap-1.5",
                  moreCategories.includes(selectedCategory)
                    ? "bg-gray-100 text-black rounded-full font-bold"
                    : "bg-transparent text-gray-400 hover:text-gray-600 font-medium"
                )}
              >
                +more
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto bg-white border-gray-200">
              {moreCategories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "text-[14px]",
                    selectedCategory === category ? "font-bold text-black" : "text-gray-600"
                  )}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
  );
}

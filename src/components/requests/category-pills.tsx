"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);

  const selectedCategory = searchParams.get("category") || "All";

  // Check scroll position
  React.useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        setCanScrollLeft(scrollLeft > 10);
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

  return (
    <div className="relative flex items-center group">
      {/* Left gradient overlay */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
      )}
      
      {/* Left chevron button */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all z-20 opacity-0 group-hover:opacity-100"
          aria-label="Scroll to previous categories"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth",
          canScrollRight && "pr-10",
          canScrollLeft && "pl-10"
        )}
      >
        {categories.map((category) => {
          const isActive = selectedCategory === category || (selectedCategory === null && category === "All");
          return (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-[#212733] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Right gradient overlay */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
      )}
      
      {/* Right chevron button */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all z-20 opacity-0 group-hover:opacity-100"
          aria-label="Scroll to next categories"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}


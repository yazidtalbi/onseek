"use client";

import { useState, useEffect } from "react";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeed } from "@/components/requests/request-feed";
import type { RequestItem } from "@/lib/types";

type Filters = {
  category?: string | null;
  status?: string | null;
  sort?: string | null;
  mine?: boolean;
  query?: string | null;
  priceMin?: string | null;
  priceMax?: string | null;
  country?: string | null;
  requestIds?: string[] | null;
};

export function RequestFeedWrapper({
  initialRequests,
  filters,
  page = 1,
  totalPages = 1,
  forceListView = false,
  allFavorited = false,
}: {
  initialRequests: RequestItem[];
  filters: Filters;
  page?: number;
  totalPages?: number;
  forceListView?: boolean;
  allFavorited?: boolean;
}) {
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    if (forceListView) return "list";
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("requestViewMode");
      return (saved === "list" || saved === "grid" ? saved : "grid") as "list" | "grid";
    }
    return "grid";
  });

  useEffect(() => {
    localStorage.setItem("requestViewMode", viewMode);
  }, [viewMode]);

  return (
    <div className="space-y-4">
      <RequestFilters 
        viewMode={viewMode} 
        onViewModeChange={setViewMode}
        hideViewToggle={forceListView}
      />
      <RequestFeed
        initialRequests={initialRequests}
        filters={filters}
        page={page}
        totalPages={totalPages}
        forceListView={forceListView}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        allFavorited={allFavorited}
      />
    </div>
  );
}


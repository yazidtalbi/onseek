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
};

export function RequestFeedWrapper({
  initialRequests,
  filters,
  page = 1,
  totalPages = 1,
  forceListView = false,
}: {
  initialRequests: RequestItem[];
  filters: Filters;
  page?: number;
  totalPages?: number;
  forceListView?: boolean;
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
      <div className="max-w-2xl mx-auto">
        <RequestFilters 
          viewMode={viewMode} 
          onViewModeChange={setViewMode}
          hideViewToggle={forceListView}
        />
      </div>
      <RequestFeed
        initialRequests={initialRequests}
        filters={filters}
        page={page}
        totalPages={totalPages}
        forceListView={forceListView}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  );
}


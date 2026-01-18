"use client";

import { useState, useEffect } from "react";
import type { RequestItem } from "@/lib/types";
import { RequestCard } from "@/components/requests/request-card";
import { RequestCardGrid } from "@/components/requests/request-card-grid";
import { Button } from "@/components/ui/button";
import { LayoutList, Grid3x3 } from "lucide-react";

export function SavedRequestsList({
  initialRequests,
}: {
  initialRequests: RequestItem[];
}) {
  // Persist view mode to localStorage - default to grid
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
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
      <div className="flex items-center justify-end gap-2">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-full">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 w-8 p-0 rounded-full"
            title="List view"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8 p-0 rounded-full"
            title="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-3">
          {initialRequests.map((request) => (
            <RequestCard key={request.id} request={request} isFavorite={true} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {initialRequests.map((request) => (
            <RequestCardGrid key={request.id} request={request} isFavorite={true} />
          ))}
        </div>
      )}
    </div>
  );
}


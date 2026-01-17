"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { RequestItem } from "@/lib/types";
import { RequestCard } from "@/components/requests/request-card";
import { RequestCardGrid } from "@/components/requests/request-card-grid";
import { Button } from "@/components/ui/button";
import { LayoutList, Grid3x3 } from "lucide-react";

type Filters = {
  category?: string | null;
  status?: string | null;
  sort?: string | null;
  mine?: boolean;
  query?: string | null;
};

export function RequestFeed({
  initialRequests,
  filters,
}: {
  initialRequests: RequestItem[];
  filters: Filters;
}) {
  // Persist view mode to localStorage
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("requestViewMode");
      return (saved === "list" || saved === "grid" ? saved : "list") as "list" | "grid";
    }
    return "list";
  });

  useEffect(() => {
    localStorage.setItem("requestViewMode", viewMode);
  }, [viewMode]);

  const { data } = useQuery({
    queryKey: ["requests", filters],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      let query = supabase.from("requests").select("*");

      if (filters.mine) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          query = query.eq("user_id", user.id);
        }
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.category && filters.category !== "All") {
        query = query.eq("category", filters.category);
      }
      if (filters.query) {
        const safeQuery = filters.query.replace(/[%_]/g, "\\$&");
        query = query.or(
          `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
        );
      }
      if (filters.sort === "active") {
        query = query.order("updated_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: requests } = await query.limit(20);
      return requests ?? [];
    },
    initialData: initialRequests,
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!data?.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No requests yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-3"
          >
            <LayoutList className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-3"
          >
            <Grid3x3 className="h-4 w-4 mr-1" />
            Grid
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-3">
          {data.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((request) => (
            <RequestCardGrid key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}


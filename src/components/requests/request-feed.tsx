"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { RequestItem } from "@/lib/types";
import { RequestCard } from "@/components/requests/request-card";
import { RequestCardGrid } from "@/components/requests/request-card-grid";
import { Button } from "@/components/ui/button";
import { LayoutList, Grid3x3, ChevronLeft, ChevronRight } from "lucide-react";

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

export function RequestFeed({
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = page;
  
  // Persist view mode to localStorage - default to grid (unless forced to list)
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

  const { data, isLoading } = useQuery({
    queryKey: ["requests", filters, currentPage],
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
      // Price filtering: show requests where the budget range overlaps with the filter range
      if (filters.priceMin || filters.priceMax) {
        const min = filters.priceMin ? parseFloat(filters.priceMin) : null;
        const max = filters.priceMax ? parseFloat(filters.priceMax) : null;
        
        if (min !== null && !isNaN(min)) {
          // Request budget_max should be >= filter min (or no max limit)
          query = query.or(`budget_max.gte.${min},budget_max.is.null`);
        }
        if (max !== null && !isNaN(max)) {
          // Request budget_min should be <= filter max (or no min limit)
          query = query.or(`budget_min.lte.${max},budget_min.is.null`);
        }
      }
      if (filters.country) {
        query = query.ilike("country", `%${filters.country}%`);
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

      // Pagination
      const limit = 20;
      const offset = (currentPage - 1) * limit;
      const { data: requests, error } = await query
        .range(offset, offset + limit - 1);
      if (error) {
        console.error("Error fetching requests:", error);
        return [];
      }
      
      // Fetch up to 3 images and submission counts for each request
      if (requests && requests.length > 0) {
        const requestIds = requests.map((r) => r.id);
        const { data: images } = await supabase
          .from("request_images")
          .select("request_id, image_url, image_order")
          .in("request_id", requestIds)
          .order("image_order", { ascending: true });
        
        // Fetch submission counts
        const { data: submissionCounts } = await supabase
          .from("submissions")
          .select("request_id")
          .in("request_id", requestIds);
        
        // Create a map of request_id -> submission count
        const submissionCountMap = new Map<string, number>();
        submissionCounts?.forEach((sub) => {
          const current = submissionCountMap.get(sub.request_id) || 0;
          submissionCountMap.set(sub.request_id, current + 1);
        });
        
        // Create a map of request_id -> array of images (max 3)
        const imageMap = new Map<string, string[]>();
        images?.forEach((img) => {
          const existing = imageMap.get(img.request_id) || [];
          if (existing.length < 3) {
            existing.push(img.image_url);
            imageMap.set(img.request_id, existing);
          }
        });
        
        // Attach images array and submission count to each request
        const requestsWithImages = requests.map((req) => ({
          ...req,
          images: imageMap.get(req.id) || [],
          submissionCount: submissionCountMap.get(req.id) || 0,
        }));
        
        // Filter out hidden requests
        if (typeof window !== "undefined") {
          try {
            const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
            return requestsWithImages.filter((req) => !hidden.includes(req.id));
          } catch (error) {
            console.error("Error reading hidden requests:", error);
            return requestsWithImages;
          }
        }
        
        return requestsWithImages;
      }
      
      // Filter out hidden requests from initial data too
      if (typeof window !== "undefined") {
        try {
          const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
          return (requests ?? []).filter((req: any) => !hidden.includes(req.id));
        } catch (error) {
          console.error("Error reading hidden requests:", error);
          return requests ?? [];
        }
      }
      
      return requests ?? [];
    },
    initialData: initialRequests, // Use initialRequests as initial data
    placeholderData: initialRequests, // Use initialRequests as placeholder while loading
    staleTime: 0, // Always consider data stale
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: "always", // Always refetch when component mounts
    refetchOnWindowFocus: false,
  });

  if (!data?.length) {
    return (
      <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-white p-8 text-center text-sm text-gray-600">
        No requests yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!forceListView && (
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
      )}

      {viewMode === "list" ? (
        <div className="space-y-3">
          {data.map((request: any) => (
            <RequestCard key={request.id} request={request} firstImage={request.images?.[0] || null} images={request.images || []} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((request: any) => (
            <RequestCardGrid key={request.id} request={request} images={request.images || []} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (currentPage > 1) {
                params.set("page", String(currentPage - 1));
              }
              router.push(`?${params.toString()}`);
            }}
            disabled={currentPage === 1}
            className="h-9 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(pageNum));
                    router.push(`?${params.toString()}`);
                  }}
                  className="h-9 w-9 rounded-lg p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (currentPage < totalPages) {
                params.set("page", String(currentPage + 1));
              }
              router.push(`?${params.toString()}`);
            }}
            disabled={currentPage >= totalPages}
            className="h-9 rounded-lg"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}


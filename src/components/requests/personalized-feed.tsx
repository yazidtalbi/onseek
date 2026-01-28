"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPreferencesAction } from "@/actions/preference.actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CategoryPills } from "@/components/requests/category-pills";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestCard } from "@/components/requests/request-card";
import { RequestInputSection } from "@/components/requests/request-input-section";
import type { RequestItem, FeedMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface PersonalizedFeedProps {
  initialMode?: FeedMode;
  initialData?: { items: RequestItem[]; nextCursor: string | null };
}

export function PersonalizedFeed({ initialMode = "for_you", initialData }: PersonalizedFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<FeedMode>(() => {
    const modeParam = searchParams.get("mode");
    return (modeParam === "for_you" || modeParam === "latest" || modeParam === "trending"
      ? modeParam
      : initialMode) as FeedMode;
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hasPreferences, setHasPreferences] = useState<boolean | undefined>(undefined);
  const hasUpdatedUrlRef = useRef(false);

  // Load user preferences to check if they have any
  useEffect(() => {
    async function loadPreferences() {
      try {
        const result = await getUserPreferencesAction();
        if (!("error" in result)) {
          setHasPreferences(result.preferences.length > 0);
          setSelectedInterests(
            result.preferences
              .map((p) => p.category?.name)
              .filter((name): name is string => !!name)
          );
        } else {
          // If error (e.g., table doesn't exist, or user not authenticated), assume no preferences
          setHasPreferences(false);
        }
      } catch (err) {
        console.warn("Could not load preferences:", err);
        setHasPreferences(false);
      }
    }
    loadPreferences();
  }, []);

  // Update URL when mode changes (but don't cause infinite loops)
  useEffect(() => {
    // Only update if preferences have loaded
    if (hasPreferences === undefined) return;
    
    // Skip if we just updated the URL (prevent infinite loop)
    if (hasUpdatedUrlRef.current) {
      hasUpdatedUrlRef.current = false;
      return;
    }
    
    const currentMode = searchParams.get("mode");
    
    // If mode is "for_you" but no preferences, switch to latest
    if (mode === "for_you" && !hasPreferences) {
      if (currentMode !== "latest") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "latest");
        hasUpdatedUrlRef.current = true;
        router.replace(`?${params.toString()}`, { scroll: false });
        setMode("latest");
      }
    } else if (currentMode !== mode && mode !== "for_you") {
      // Only update if the URL mode doesn't match our state mode
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", mode);
      hasUpdatedUrlRef.current = true;
      router.replace(`?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hasPreferences]);

  // Get filter params from URL
  const category = searchParams.get("category") || null;
  const priceMin = searchParams.get("priceMin") || null;
  const priceMax = searchParams.get("priceMax") || null;
  const country = searchParams.get("country") || null;
  const sort = searchParams.get("sort") || null;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["personalized-feed", mode, category, priceMin, priceMax, country, sort],
    queryFn: async ({ pageParam }) => {
      const supabase = createBrowserSupabaseClient();
      const limit = 20;
      
      // Build query
      let query = supabase
        .from("requests")
        .select("*")
        .eq("status", "open");
      
      // Apply filters
      if (category && category !== "All") {
        query = query.eq("category", category);
      }
      if (country) {
        query = query.ilike("country", `%${country}%`);
      }
      if (priceMin || priceMax) {
        const min = priceMin ? parseFloat(priceMin) : null;
        const max = priceMax ? parseFloat(priceMax) : null;
        if (min !== null && !isNaN(min)) {
          query = query.or(`budget_max.gte.${min},budget_max.is.null`);
        }
        if (max !== null && !isNaN(max)) {
          query = query.or(`budget_min.lte.${max},budget_min.is.null`);
        }
      }
      
      // Apply sort
      const sortMode = sort || (mode === "latest" ? "newest" : mode === "trending" ? "active" : "newest");
      if (sortMode === "active") {
        query = query.order("updated_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }
      
      // Cursor-based pagination
      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }
      
      const { data: requests, error: queryError } = await query.limit(limit + 1);
      
      if (queryError) {
        throw new Error(queryError.message);
      }
      
      if (!requests || requests.length === 0) {
        return {
          items: [],
          nextCursor: null,
        };
      }
      
      const hasMore = requests.length > limit;
      const items = requests.slice(0, limit);
      const nextCursor = hasMore ? items[items.length - 1].created_at : null;
      
      // Fetch images, links, and submission counts in parallel
      const requestIds = items.map((r: any) => r.id);
      const [imagesResult, linksResult, submissionCountsResult] = await Promise.all([
        supabase
          .from("request_images")
          .select("request_id, image_url, image_order")
          .in("request_id", requestIds)
          .order("image_order", { ascending: true }),
        supabase
          .from("request_links")
          .select("request_id, url")
          .in("request_id", requestIds),
        supabase
          .from("submissions")
          .select("request_id")
          .in("request_id", requestIds),
      ]);
      
      // Create maps for efficient lookups
      const imageMap = new Map<string, string[]>();
      imagesResult.data?.forEach((img) => {
        const existing = imageMap.get(img.request_id) || [];
        if (existing.length < 3) {
          existing.push(img.image_url);
          imageMap.set(img.request_id, existing);
        }
      });
      
      const linkMap = new Map<string, string[]>();
      linksResult.data?.forEach((link) => {
        const existing = linkMap.get(link.request_id) || [];
        existing.push(link.url);
        linkMap.set(link.request_id, existing);
      });
      
      const submissionCountMap = new Map<string, number>();
      submissionCountsResult.data?.forEach((sub) => {
        const current = submissionCountMap.get(sub.request_id) || 0;
        submissionCountMap.set(sub.request_id, current + 1);
      });
      
      // Attach images, links, and submission counts to items
      const itemsWithExtras = items.map((req: any) => ({
        ...req,
        images: imageMap.get(req.id) || [],
        links: linkMap.get(req.id) || [],
        submissionCount: submissionCountMap.get(req.id) || 0,
      }));
      
      return {
        items: itemsWithExtras,
        nextCursor,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    initialData: initialData ? { pages: [initialData], pageParams: [undefined] } : undefined,
    placeholderData: (previousData) => previousData, // Show stale data while refetching
  });

  const allItems = useMemo(() => {
    if (!data || !data.pages) return [];
    
    const items = data.pages.flatMap((page) => page?.items || []);
    
    // Filter out hidden requests (client-side only)
    if (typeof window === "undefined") {
      return items;
    }
    
    try {
      const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
      return items.filter((item: RequestItem) => !hidden.includes(item.id));
    } catch (error) {
      console.error("Error reading hidden requests:", error);
      return items;
    }
  }, [data]);

  const handleModeChange = (newMode: FeedMode) => {
    setMode(newMode);
  };


  return (
    <div className="space-y-4">
      <div className="pb-4">
        <RequestInputSection />
      </div>
      <CategoryPills />
      
      {/* Description text */}
      <p className="text-sm text-gray-400">
        Browse requests that match your preferences and interests.
        <br />
        Ordered by most relevant.
      </p>

      <RequestFilters hideViewToggle={true} />

      {/* Error state */}
      {isError ? (
        <div className="max-w-2xl mx-auto w-full">
          <div className="rounded-lg border border-dashed border-[#e5e7eb]  p-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Failed to load feed</p>
            {error && (
              <p className="text-xs text-red-500 mb-4">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}
            <Button onClick={() => refetch()} variant="outline">
              Try again
            </Button>
          </div>
        </div>
      ) : allItems.length === 0 ? (
        <div className="max-w-2xl mx-auto w-full">
          <div className="rounded-lg border border-dashed border-[#e5e7eb]  p-8 text-center">
            {mode === "for_you" && !hasPreferences ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Personalize your feed by selecting your interests
                </p>
                <Button asChild className="bg-[#7755FF] hover:bg-[#6644EE]">
                  <Link href="/app/settings">Choose Categories</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">No requests found</p>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : allItems.length > 0 ? (
        <>
          {/* Show subtle loading indicator while fetching */}
          {isFetching && !isLoading && (
            <div className="max-w-2xl mx-auto w-full flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
          
          <div className="max-w-2xl mx-auto w-full">
            {allItems.map((request: RequestItem, index: number) => {
              const requestWithExtras = request as RequestItem & { images?: string[]; links?: string[] };
              return (
                <RequestCard
                  key={request.id}
                  request={request}
                  variant="feed"
                  images={requestWithExtras.images || []}
                  links={requestWithExtras.links || []}
                  isFirst={index === 0}
                  isLast={index === allItems.length - 1}
                />
              );
            })}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className=""
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}


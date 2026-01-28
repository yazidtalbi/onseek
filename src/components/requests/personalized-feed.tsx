"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPersonalizedFeedAction, getUserPreferencesAction } from "@/actions/preference.actions";
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
}

export function PersonalizedFeed({ initialMode = "for_you" }: PersonalizedFeedProps) {
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
      try {
        console.log("[PersonalizedFeed] Fetching feed with params:", { mode, category, priceMin, priceMax, country, sort, pageParam });
        const startTime = Date.now();
        const result = await getPersonalizedFeedAction(mode, pageParam, 20, {
          category,
          priceMin,
          priceMax,
          country,
          sort,
        });
        const duration = Date.now() - startTime;
        console.log(`[PersonalizedFeed] Query completed in ${duration}ms`);
        
        if ("error" in result) {
          console.error("[PersonalizedFeed] Feed error:", result.error);
          throw new Error(result.error);
        }
        
        console.log("[PersonalizedFeed] Feed loaded successfully:", result.items?.length || 0, "items");
        console.log("[PersonalizedFeed] First item sample:", result.items?.[0] ? {
          id: result.items[0].id,
          title: result.items[0].title,
          hasImages: !!(result.items[0] as any).images,
          hasLinks: !!(result.items[0] as any).links,
        } : "No items");
        return result;
      } catch (error) {
        console.error("[PersonalizedFeed] Feed fetch error:", error);
        console.error("[PersonalizedFeed] Error stack:", error instanceof Error ? error.stack : "No stack");
        throw error;
      }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const cursor = lastPage.nextCursor || undefined;
      console.log("[PersonalizedFeed] Next page param:", cursor);
      return cursor;
    },
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    enabled: true, // Explicitly enable the query
  });

  const allItems = useMemo(() => {
    if (!data) return [];
    
    const items = data.pages.flatMap((page) => page.items) || [];
    
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

  // Debug logging
  useEffect(() => {
    console.log("[PersonalizedFeed] State:", {
      isLoading,
      isFetching,
      isError,
      hasData: !!data,
      itemsCount: allItems.length,
      pagesCount: data?.pages?.length || 0,
    });
  }, [isLoading, isFetching, isError, data, allItems.length]);

  return (
    <div className="space-y-4">
      <div className="pb-4">
        <RequestInputSection />
      </div>
      <CategoryPills />
      
      {/* Description text */}
      <p className="text-sm text-gray-400">
        Browse requests that match your preferences and interests. Ordered by most relevant.
      </p>

      <RequestFilters hideViewToggle={true} />

      {/* Loading state - only for requests area */}
      {isLoading ? (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : isError ? (
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
      ) : (
        <>
          {/* Show subtle loading indicator while fetching */}
          {isFetching && !isLoading && (
            <div className="max-w-2xl mx-auto w-full flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
          
          <div className="max-w-2xl mx-auto w-full space-y-1">
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
      )}
    </div>
  );
}


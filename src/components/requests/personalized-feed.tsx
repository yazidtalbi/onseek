"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPreferencesAction } from "@/actions/preference.actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CategoryPills } from "@/components/requests/category-pills";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem, FeedMode } from "@/lib/types";
import { useAuth } from "@/components/layout/auth-provider";
import { usePathname } from "next/navigation";
import { FaqSection } from "@/components/requests/faq-section";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PersonalizedFeedProps {
  initialMode?: FeedMode;
  initialData?: { items: RequestItem[]; nextCursor: string | null };
}

export function PersonalizedFeed({ initialMode = "for_you", initialData }: PersonalizedFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user } = useAuth();
  const isHomePage = pathname === "/app" || pathname === "/";
  const [mode, setMode] = useState<FeedMode>(() => {
    const modeParam = searchParams.get("mode");
    return (modeParam === "for_you" || modeParam === "latest" || modeParam === "trending"
      ? modeParam
      : initialMode) as FeedMode;
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hasPreferences, setHasPreferences] = useState<boolean | undefined>(undefined);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
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
      const limit = isHomePage ? 16 : 20;

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

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const allItems = useMemo(() => {
    if (!data || !data.pages) return [];

    const items = data.pages.flatMap((page) => page?.items || []);

    // Filter out hidden requests (client-side only, post-hydration)
    if (!mounted || typeof window === "undefined") {
      return items;
    }

    try {
      const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
      return items.filter((item: RequestItem) => !hidden.includes(item.id));
    } catch (error) {
      console.error("Error reading hidden requests:", error);
      return items;
    }
  }, [data, mounted]);

  const handleModeChange = (newMode: FeedMode) => {
    setMode(newMode);
  };

  // Infinite scroll: load more when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      // Check if we're near the bottom of the page (within 200px)
      if (
        !isHomePage &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200 &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isFetching
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);


  return (
    <div className="flex flex-col w-full">
      <section className="relative mx-auto w-full max-w-[1360px] mb-8 rounded-[32px] bg-white px-6 py-12 sm:px-10 sm:py-16 overflow-hidden flex items-center justify-center min-h-[440px]">
        {/* Left Hero Image */}
        <div className="hidden lg:block absolute -left-6 xl:-left-10 top-[40%] -translate-y-1/2 w-[260px] xl:w-[320px] h-[260px] xl:h-[320px] pointer-events-none z-0">
          <Image src="/hero/left.png" alt="Microphone composition" fill className="object-contain mix-blend-multiply" priority />
        </div>

        {/* Right Hero Image */}
        <div className="hidden lg:block absolute -right-6 xl:-right-10 top-[40%] -translate-y-1/2 w-[260px] xl:w-[320px] h-[260px] xl:h-[320px] pointer-events-none z-0">
          <Image src="/hero/right.png" alt="Gadgets composition" fill className="object-contain mix-blend-multiply" priority />
        </div>

        <div className="mx-auto w-full text-center flex flex-col items-center max-w-3xl relative z-10">
          <div className="relative flex items-center p-1.5 bg-[#f4f5f8] rounded-2xl mb-6 w-fit mx-auto">
            <div
              className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl transition-all duration-300 ease-out"
              style={{
                left: tradeMode === "buy" ? '6px' : 'calc(50%)'
              }}
            />
            <button
              type="button"
              onClick={() => setTradeMode("buy")}
              className={cn(
                "relative z-10 px-8 py-2.5 min-w-[120px] text-[13px] font-bold tracking-widest transition-colors duration-300 outline-none",
                tradeMode === "buy" ? "text-[#1e2330]" : "text-[#8e95a5] hover:text-[#6a7282]"
              )}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setTradeMode("sell")}
              className={cn(
                "relative z-10 px-8 py-2.5 min-w-[120px] text-[13px] font-bold tracking-widest transition-colors duration-300 outline-none",
                tradeMode === "sell" ? "text-[#1e2330]" : "text-[#8e95a5] hover:text-[#6a7282]"
              )}
            >
              SELL
            </button>
          </div>

          <h1 
            className="mx-auto text-3xl leading-tight tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]"
            style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}
          >
            Stop searching, start <span className="text-[#7860fe] bg-[#f0edff] px-3 py-1 rounded-l-lg pb-1.5 align-baseline border-solid border-r-[3px]" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600, borderRightColor: "#7860fe" }}>seeking</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg">
            Post a request, receive offers, compare deals,<br />and connect with the right seller.
          </p>

          <div className={cn(
            "mx-auto w-full max-w-xl relative transition-all duration-500",
            tradeMode === "buy" ? "mt-8" : "mt-2"
          )}>
            <div className="relative w-full h-[130px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/60 via-indigo-50/60 to-purple-100/60 blur-3xl rounded-full scale-[1.1] -z-10 pointer-events-none" />

              {/* BUY Panel */}
              <div
                onClick={() => router.push('/app/new')}
                role="button"
                tabIndex={0}
                className={cn(
                  "absolute inset-0 w-full rounded-2xl bg-white border border-[#e6e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 ease-out hover:bg-white hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] h-[130px] flex flex-col p-5 cursor-pointer group",
                  tradeMode === 'buy' ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                )}
              >
                <span className="text-[#a5abb7] text-[16px] font-medium text-left flex-1 pl-1 pt-1 font-sans">
                  I'm looking for a smartphone with 8gb..
                </span>
                <div className="absolute bottom-4 right-4">
                  <div className="rounded-full bg-[#222234] group-hover:bg-[#1a1a27] text-white px-6 py-2.5 text-[15px] font-medium flex items-center justify-center transition-colors">
                    Request
                  </div>
                </div>
              </div>

              {/* SELL Panel */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-[130px] flex items-center justify-center transition-all duration-500 ease-out",
                  tradeMode === 'sell' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}
              >
                <Button
                  asChild
                  className="rounded-full bg-[#1e2330] hover:bg-[#2a303f] text-white px-10 py-6 text-[16px] font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/app/new">Sell your item</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="shrink-0 mb-2">
        <CategoryPills />
      </div>

      <RequestFilters hideViewToggle={true} />

      {/* Error state */}
      {isError ? (
        <div className="mx-auto w-full">
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
        <div className="mx-auto w-full">
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
        <div className="relative group w-full flex flex-col">
          {/* Show subtle loading indicator while fetching */}
          {isFetching && !isLoading && (
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-center py-2 pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}

          <div className="columns-1 md:columns-2 xl:columns-3 gap-6 py-4">
            {allItems.map((request: RequestItem) => {
              const requestWithExtras = request as RequestItem & { images?: string[]; links?: string[] };
              return (
                <div key={request.id} className="break-inside-avoid mb-6">
                  <Link
                    href={`/app/requests/${request.id}`}
                    className="block w-full"
                  >
                    <RequestCard
                      request={request}
                      variant="detail"
                      images={requestWithExtras.images || []}
                      links={requestWithExtras.links || []}
                      smallImages={true}
                    />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="w-full flex justify-center py-8">
            <Button
              onClick={() => {
                if (!user) {
                  router.push("/login");
                } else {
                  if (isHomePage) {
                    router.push("/search"); // Or another route, but let's just fetch next page if they want infinite load here
                  }
                  fetchNextPage();
                }
              }}
              disabled={isFetchingNextPage && !!user}
              variant="outline"
              className="rounded-full font-medium h-10 px-6 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center shadow-sm"
            >
              {isFetchingNextPage && user ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isFetchingNextPage && user ? "Loading..." : "Explore projects"}
            </Button>
          </div>

          {isHomePage && <FaqSection />}

          {isHomePage && (
            <div className="w-full bg-[#785ffe] rounded-[32px] px-8 py-24 sm:px-16 mt-16 mb-8 flex flex-col items-center text-center justify-center min-h-[400px]">
              <h2 className="text-4xl lg:text-6xl tracking-tight text-white mb-10 max-w-2xl" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
                Let your item come fiiind you
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Button size="lg" className="rounded-full bg-white hover:bg-white/90 text-[#785ffe] px-10 h-14 text-[16px] font-bold w-full sm:w-auto shadow-sm" onClick={() => router.push(user ? '/app/new' : '/signup')}>
                  Join the community now
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center py-4 mt-8">
            <p className="text-xs text-gray-400">&copy; 2026 OnSeek</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

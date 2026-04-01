"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPreferencesAction } from "@/actions/preference.actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CategoryPills } from "@/components/requests/category-pills";
import dynamic from "next/dynamic";
import { RequestCard } from "@/components/requests/request-card";
import { FeedModeTabs } from "@/components/requests/feed-mode-tabs";
import { HeroSection } from "@/components/requests/hero-section";
import { REVERSE_MODE_MAP, getCategorySlug } from "@/lib/utils/category-routing";
import type { RequestItem, FeedMode } from "@/lib/types";
import { useAuth } from "@/components/layout/auth-provider";
import { usePathname } from "next/navigation";
import { FaqSection } from "@/components/requests/faq-section";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const AuthModal = dynamic(() => import("@/components/auth/auth-modal").then(mod => mod.AuthModal), {
  ssr: false,
});

const FiltersModal = dynamic(() => import("@/components/requests/filters-modal").then(mod => mod.FiltersModal), {
  ssr: false,
});

interface PersonalizedFeedProps {
  initialMode?: FeedMode;
  initialCategory?: string | null;
  initialData?: { items: RequestItem[]; nextCursor: string | null };
}

export function PersonalizedFeed({
  initialMode = "for_you",
  initialCategory = null,
  initialData
}: PersonalizedFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const isHomePage = pathname === "/app" || pathname === "/";
  const showHero = isHomePage && !user;
  const [mode, setMode] = useState<FeedMode>(() => {
    // Determine mode from pathname first
    if (pathname.includes("/app/popular")) return "trending";
    if (pathname.includes("/app/latest")) return "latest";
    if (pathname.includes("/app/for-you")) return "for_you";

    const modeParam = searchParams.get("mode");
    return (modeParam === "for_you" || modeParam === "latest" || modeParam === "trending"
      ? modeParam
      : initialMode) as FeedMode;
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [hasPreferences, setHasPreferences] = useState<boolean | undefined>(undefined);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
  const category = initialCategory || searchParams.get("category") || null;
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

    // Build path based on new mode and current category
    const modePath = REVERSE_MODE_MAP[newMode] || "for-you";
    const categoryPath = category && category !== "All" ? `/${getCategorySlug(category)}` : "";

    router.push(`/app/${modePath}${categoryPath}`);
  };

  // Infinite scroll: load more when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      // Check if we're near the bottom of the page (within 200px)
      if (
        (user || !isHomePage) &&
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
      {showHero && (
        <HeroSection 
          user={user} 
          tradeMode={tradeMode} 
          setTradeMode={setTradeMode} 
        />
      )}

      {!showHero && (
        <div className="py-2 min-h-[80px] mb-0">
          <div className="mx-auto w-full text-center flex flex-col items-center relative z-10 max-w-full px-0">
            <div className="w-full flex flex-col items-stretch">
              <CategoryPills 
                mode={mode} 
                hasPreferences={hasPreferences} 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                hideViewToggle={false}
              />
            </div>
          </div>
        </div>
      )}

      {showHero && (
        <div className="w-full mb-4">
          <CategoryPills 
            mode={mode} 
            hasPreferences={hasPreferences} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            hideViewToggle={false}
          />
        </div>
      )}

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

          <div className={cn("py-4 w-full", viewMode === "grid" ? "columns-1 md:columns-2 xl:columns-3 gap-6" : "flex flex-col gap-4 max-w-2xl mx-auto")}>
            {/* Inject textarea for creation at top of masonry if logged in */}
            {user && isHomePage && (
              <div className="break-inside-avoid mb-6">
                <div
                  role="button"
                  tabIndex={-1}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                  }}
                  className="w-full rounded-2xl bg-white border border-[#e6e7eb] shadow-none transition-all duration-300 min-h-[140px] flex flex-col p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 mb-2">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-foreground font-medium text-base shrink-0">
                      {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-[#a5abb7] text-[16px] font-medium font-sans">
                      What are you looking for, {profile?.username || "Guest"}?
                    </span>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <div className="rounded-full bg-[#1e2330] hover:bg-[#2a303f] text-white px-6 py-2.5 text-[15px] font-medium flex items-center justify-center transition-colors shadow-sm">
                      Request
                    </div>
                  </div>
                </div>
              </div>
            )}

            {allItems.map((request: RequestItem, index: number) => {
              const requestWithExtras = request as RequestItem & { images?: string[]; links?: string[] };
              return (
                <div key={request.id} className="break-inside-avoid mb-6 bg-[#f5f6f9] rounded-[20px] p-[6px] transition-all duration-300 ease-out hover:scale-[1.02] shadow-none hover:shadow-none">
                  <RequestCard
                    request={request}
                    variant="detail"
                    images={requestWithExtras.images || []}
                    links={requestWithExtras.links || []}
                    smallImages={true}
                    noBorder={true}
                    priority={index < 6}
                  />
                </div>
              );
            })}
          </div>

          <div className="w-full flex justify-center py-8">
            {(!user && isHomePage) ? (
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="rounded-full font-medium h-10 px-6 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center shadow-sm"
              >
                Explore projects
              </Button>
            ) : (
              isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            )}
          </div>

          {showHero && <FaqSection />}

          {showHero && (
            <div className="w-full bg-[#785ffe] rounded-[32px] px-8 py-24 sm:px-16 mt-16 mb-8 flex flex-col items-center text-center justify-center min-h-[400px]">
              <h2 className="text-4xl lg:text-6xl tracking-tight text-white mb-10 max-w-2xl" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 500 }}>
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
      {isAuthModalOpen && (
        <AuthModal
          open={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          title="Sell your items to the world"
          description="Sign in or create an account to start selling and track your inventory on Onseek."
        />
      )}
    </div>
  );
}

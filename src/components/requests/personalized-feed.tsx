"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from "react";
import AppLoading from "@/app/(app)/loading";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPreferencesAction, getPersonalizedFeedAction } from "@/actions/preference.actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CategoryPills } from "@/components/requests/category-pills";
import dynamic from "next/dynamic";
import { RequestCard } from "@/components/requests/request-card";
import { FeedModeTabs } from "@/components/requests/feed-mode-tabs";
import { HeroSection } from "@/components/requests/hero-section";
import { HeroSectionV2 } from "@/components/requests/hero-section-v2";
import { REVERSE_MODE_MAP, getCategorySlug } from "@/lib/utils/category-routing";
import type { RequestItem, FeedMode } from "@/lib/types";
import { useAuth } from "@/components/layout/auth-provider";
import { usePathname } from "next/navigation";
import { FaqSection } from "@/components/requests/faq-section";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronRight, Sparkles, ListFilter, Rows3, LayoutGrid, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { AIRequestFlow } from "./ai-request-flow";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "@/components/landing/announcement-bar";
import { RequestAnimationSection } from "@/components/landing/request-animation-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { UserChoiceSection } from "@/components/landing/user-choice-section";
import { PublicFooter } from "@/components/layout/public-footer";
import { getRequestTheme } from "@/lib/utils/request-themes";

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
  const isHomePage = pathname === "/" || pathname === "/" || pathname.startsWith("/requests/");
  const showHero = (pathname === "/" || pathname === "/") && !user;
  const [mode, setMode] = useState<FeedMode>(() => {
    // Determine mode from pathname first
    if (pathname.includes("/popular")) return "trending";
    if (pathname.includes("/latest")) return "latest";
    if (pathname.includes("/for-you")) return "for_you";

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
  const [isAIFlowOpen, setIsAIFlowOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const priceMaxParam = searchParams.get("priceMax") || "";
  const countryParam = searchParams.get("country") || "";
  const [localPriceMax, setLocalPriceMax] = useState(priceMaxParam);

  useEffect(() => {
    setLocalPriceMax(priceMaxParam);
  }, [priceMaxParam]);

  const hasActiveFilters = searchParams.get("priceMin") || searchParams.get("priceMax") || searchParams.get("country");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "Discover" || value === "" || value === "0") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key === "category") params.delete("page");
    const hasQuery = searchParams.get("q");
    const path = hasQuery ? "/search" : pathname;
    router.push(`${path}?${params.toString()}`);
  };

  const handleModeChange = (newMode: string) => {
    if (user) {
      setMode(newMode as FeedMode);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("mode");

    const modePath = REVERSE_MODE_MAP[newMode as FeedMode] || "latest";
    const pathParts = pathname.split('/');
    const lastPart = pathParts.pop();
    const isCategoryPath = pathname.includes('/popular/') || pathname.includes('/latest/');
    const isSpecialRoot = lastPart === 'for-you' || lastPart === 'popular' || lastPart === 'latest';

    if (isCategoryPath && lastPart && !isSpecialRoot) {
      router.push(`/${modePath}/${lastPart}?${params.toString()}`);
    } else {
      router.push(`/${modePath}?${params.toString()}`);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasUpdatedUrlRef = useRef(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [searchValue]);

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

  // Auto-resume AI flow if a draft exists in session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("onseek_ai_draft");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.initialText) {
            setSearchValue(parsed.initialText);
          }
          setIsAIFlowOpen(true);
        } catch (e) {
          console.error("Failed to parse AI draft during resume", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Only update if preferences have loaded
    if (hasPreferences === undefined) return;

    if (mode === "for_you" && !hasPreferences) {
      setMode("latest");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hasPreferences]);

  // Get filter params from URL
  const category = initialCategory || searchParams.get("category") || null;
  const priceMin = searchParams.get("priceMin") || null;
  const priceMax = searchParams.get("priceMax") || null;
  const country = searchParams.get("country") || "";
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
    queryKey: ["personalized-feed", user?.id, mode, category, priceMin, priceMax, country, sort],
    queryFn: async ({ pageParam }) => {
      const limit = isHomePage ? 16 : 20;

      const response = await getPersonalizedFeedAction(
        mode,
        pageParam as string | undefined,
        limit,
        {
          category,
          priceMin,
          priceMax,
          country,
          sort,
        }
      );

      if ('error' in response) {
        throw new Error(response.error);
      }

      return {
        items: response.items,
        nextCursor: response.nextCursor,
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

    let items = data.pages.flatMap((page) => page?.items || []);

    // Filter out hidden requests (client-side only, post-hydration)
    if (!mounted || typeof window === "undefined") {
      return (!user && isHomePage) ? items.slice(0, 6) : items;
    }

    try {
      const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
      items = items.filter((item: RequestItem) => !hidden.includes(item.id));
    } catch (error) {
      console.error("Error reading hidden requests:", error);
    }

    return (!user && isHomePage) ? items.slice(0, 6) : items;
  }, [data, mounted, user, isHomePage]);


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
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage, user, isHomePage]);




  return (
    <div className="flex flex-col w-full flex-1">
      {showHero && (
        <>
          <HeroSectionV2
            user={user}
            profile={profile}
            tradeMode={tradeMode}
            setTradeMode={setTradeMode}
          />
          <AnnouncementBar />
        </>
      )}

        <div className={cn(
          "mx-auto w-full px-3 md:px-6", 
          !user 
            ? "max-w-[1280px] pt-0 sm:pt-12" 
            : (pathname === "/" ? "pt-2 sm:pt-4" : "pt-0 sm:pt-4")
        )}>
        {/* Editorial Title - Hidden as requested */}
        {/* <div className="text-left pt-16 pb-12">
          <h2 
            className="text-[40px] leading-[1.1] text-[#1A1A1A] font-bold tracking-tight max-w-4xl" 
            style={{ fontFamily: 'var(--font-expanded)' }}
          >
            Discover what people <br className="hidden md:block" /> are looking for
          </h2>
        </div> */}
        {/* Categories Strip */}
        <div className={cn(
          "py-2 min-h-[70px] flex flex-col justify-center mb-2 md:mb-6 bg-white transition-all duration-300",
          user 
            ? (pathname === "/" ? "pt-8 md:pt-2" : "pt-0 md:pt-2") 
            : "pt-2"
        )}>
          <div className="mx-auto w-full text-center flex flex-col items-center relative z-10 w-full px-0">
            <div className="w-full flex flex-col items-stretch">
              <CategoryPills
                mode={mode}
                leftElement={user ? (
                  <FiltersModal 
                    open={filtersOpen} 
                    onOpenChange={setFiltersOpen}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    sortMode={mode === "for_you" ? "latest" : mode}
                    onSortModeChange={handleModeChange}
                  >
                    <button
                      className={cn(
                        "w-10 h-10 p-0 flex items-center justify-center rounded-full text-sm font-medium transition-colors border md:hidden shrink-0",
                        hasActiveFilters || filtersOpen
                          ? "bg-gray-100 text-gray-900 border-gray-300"
                          : "bg-white border-gray-200 text-gray-600 hover:text-gray-900"
                      )}
                      title="Filters"
                    >
                      <ListFilter className="h-4 w-4" />
                    </button>
                  </FiltersModal>
                ) : undefined}
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {(isLoading || hasPreferences === undefined) && allItems.length === 0 ? (
          user ? <AppLoading /> : null
        ) : isError ? (
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
                    <Link href="/settings">Choose Categories</Link>
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
            <div className="relative group w-full flex flex-col text-left">
            {/* Section Header */}
            <div className={cn(
              "flex flex-col gap-4 mb-8",
              pathname === "/" && "hidden md:flex"
            )}>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl md:text-3xl font-semibold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-expanded)' }}>
                    {(() => {
                      if (user) {
                        if (category) {
                          const formattedCategory = category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                          return `${formattedCategory} Requests`;
                        }
                        return "Discover";
                      }
                      return "Requests we love";
                    })()}
                  </h3>
                  <p className="text-sm md:text-base text-gray-400 font-medium">
                    {user ? "Personalized selection just for you" : "Standout requests making waves around the platform"}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {!user && isHomePage && (
                    <Link
                      href="/popular"
                      className="text-sm font-bold text-[#1A1A1A] hover:underline flex items-center gap-1 shrink-0 mr-4"
                    >
                      View more
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                  {user && (
                    <div className="flex items-center gap-2">
                      {/* Filter Button - Hidden on mobile, moved to CategoryPills */}
                      <button
                        onClick={() => setFiltersOpen(!filtersOpen)}
                        className={cn(
                          "hidden md:flex w-9 h-9 p-0 items-center justify-center rounded-full text-sm font-medium transition-colors border",
                          hasActiveFilters || filtersOpen
                            ? "bg-gray-100 text-gray-900 border-gray-300"
                            : "bg-white border-transparent text-gray-600 hover:text-gray-900"
                        )}
                        title="Filters"
                      >
                        <ListFilter className="h-4 w-4" />
                      </button>
                      
                      {/* Inline Filters Modal for Desktop only (hidden on mobile) */}
                      <div className="hidden md:block">
                        <FiltersModal 
                          open={filtersOpen} 
                          onOpenChange={setFiltersOpen}
                          viewMode={viewMode}
                          onViewModeChange={setViewMode}
                          sortMode={mode === "for_you" ? "latest" : mode}
                          onSortModeChange={handleModeChange}
                        >
                          <span className="hidden" />
                        </FiltersModal>
                      </div>

                      {/* Sort (Latest) - Hidden on mobile */}
                      <div className="hidden md:block">
                        <Select value={mode === "for_you" ? "latest" : mode} onValueChange={handleModeChange}>
                          <SelectTrigger className="px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 border-transparent bg-white text-gray-600 hover:text-gray-900 h-9 shadow-none focus:ring-0 w-auto">
                            <span className="truncate">
                              {mode === "trending" ? "Trending" : "Latest"}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-white min-w-[150px]">
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="trending">Trending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* View Toggle - Hidden on mobile */}
                      <div className="hidden md:flex items-center gap-1 rounded-full bg-gray-100 p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className={cn("h-7 w-7 p-0 rounded-full", viewMode === "list" ? "bg-white text-gray-900" : "bg-transparent text-gray-500 hover:text-gray-900")}
                          title="List view"
                        >
                          <Rows3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className={cn("h-7 w-7 p-0 rounded-full", viewMode === "grid" ? "bg-white text-gray-900" : "bg-transparent text-gray-500 hover:text-gray-900")}
                          title="Grid view"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

              {/* Expanded Inline Filters */}
              {filtersOpen && (
                <div className="w-full flex items-center justify-end gap-6 p-4 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[16px] transition-all">
                  <div className="flex-1 max-w-[240px]">
                    <Label className="text-[13px] font-semibold text-gray-700 mb-1.5 block text-left">Max Budget ($)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="No limit"
                        value={localPriceMax}
                        onChange={(e) => setLocalPriceMax(e.target.value)}
                        onBlur={() => updateParam("priceMax", localPriceMax)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateParam("priceMax", localPriceMax);
                          }
                        }}
                        className="h-10 rounded-xl bg-white border-gray-200"
                      />
                      <Button 
                        onClick={() => updateParam("priceMax", localPriceMax)}
                        variant="outline"
                        className="h-10 rounded-xl px-4 font-bold text-xs bg-white hover:bg-gray-50 border-gray-200 shrink-0"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[240px]">
                    <Label className="text-[13px] font-semibold text-gray-700 mb-1.5 block text-left">Country</Label>
                    <CountryCombobox
                      value={country}
                      onChange={(val) => updateParam("country", val)}
                    />
                  </div>
                </div>
              )}
            </div>

          <div className="relative w-full">
            {/* Loading Overlay for filters */}
            {isFetching && !isLoading && (
              <div className="absolute inset-0 z-[40] flex items-center justify-center transition-all duration-300 pointer-events-none">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                  <span className="text-xs font-bold text-black uppercase tracking-widest">Updating</span>
                </div>
              </div>
            )}

            <div className={cn(
              "pb-4 w-full relative transition-all duration-300", 
              isFetching && !isLoading ? "opacity-40 blur-[1px]" : "opacity-100",
              viewMode === "grid" ? "columns-[360px] gap-6" : "flex flex-col gap-4 max-w-2xl mx-auto"
            )}>
              {user && isHomePage && (
                <div className="break-inside-avoid mb-6">
                  <div className="w-full rounded-[24px] bg-white border border-[#e6e7eb] shadow-none min-h-[100px] md:min-h-[140px] flex flex-col p-3 md:p-5">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 mt-1 rounded-full bg-gray-100 text-foreground font-medium text-base shrink-0 overflow-hidden relative">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.username || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (profile?.first_name?.charAt(0) || profile?.username?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U")
                        )}
                      </div>
                      <textarea
                        ref={textareaRef}
                        placeholder="Describe what you are looking for..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (searchValue.trim()) {
                              setIsAIFlowOpen(true);
                            } else {
                              window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                            }
                          }
                        }}
                        rows={2}
                        className="bg-transparent border-none outline-none w-full text-[#1A1A1A] placeholder:text-[#a5abb7] placeholder:text-[13px] md:placeholder:text-[18px] text-[13px] md:text-[18px] font-medium resize-none overflow-hidden leading-relaxed pt-1.5"
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={() => {
                          if (searchValue.trim()) {
                            setIsAIFlowOpen(true);
                          } else {
                            window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                          }
                        }}
                        className="h-8 md:h-10 px-4 md:px-6 gap-2 bg-[#1A1A1A] hover:bg-black text-white rounded-full text-[12px] md:text-[14px] font-bold shadow-none shrink-0"
                      >
                        <span>Post</span>
                        <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" strokeWidth={3} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {allItems.map((request: RequestItem, index: number) => {
                const requestWithExtras = request as RequestItem & { images?: string[]; links?: string[] };
                return (
                  <Fragment key={request.id}>
                    {/* Brand CTA Cards injected at specific intervals */}
                    {(() => {
                      // First CTA: Start Requesting (Orange)
                      if (user && index === 2) {
                        return (
                          <div
                            onClick={() => window.dispatchEvent(new CustomEvent('open-create-request-modal'))}
                            className="break-inside-avoid mb-6 aspect-square rounded-[32px] bg-[#FF8C5A] p-10 flex flex-col justify-between text-[#1A1A1A] relative overflow-hidden group/cta cursor-pointer shadow-none transition-all duration-300"
                          >
                            {/* Top: Avatar Stack */}
                            <div className="relative flex items-center -space-x-4 mb-6 z-10">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-[3px] border-[#FF8C5A] overflow-hidden bg-white/20">
                                  <img
                                    src={`https://i.pravatar.cc/150?u=${i + 10}`}
                                    alt="User"
                                    className="w-full h-full object-cover saturate-[1.2] transition-all cursor-pointer"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col justify-center">
                              <h3
                                className="text-[36px] md:text-[42px] leading-[0.95] mb-2 tracking-tighter text-black"
                                style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif", fontWeight: 600 }}
                              >
                                Can&apos;t find it? <br /> Request it.
                              </h3>
                              <p className="text-black/60 text-[16px] font-bold leading-tight mt-2 max-w-[240px]">
                                Join thousands of seekers and get exposure to the best sellers.
                              </p>
                            </div>

                            <div className="relative z-10 pt-8">
                              <div className="inline-flex items-center bg-white text-black px-8 py-4 rounded-full text-[15px] font-black tracking-tight hover:bg-white/90 transition-all shadow-sm">
                                Start requesting
                              </div>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                          </div>
                        );
                      }

                      // Second CTA: Fulfill Requests (Purple) - New!
                      if (user && index === 8) {
                        return (
                          <div
                            className="break-inside-avoid mb-6 aspect-[10/11] rounded-[32px] bg-[#6825DA] p-10 flex flex-col text-white relative overflow-hidden group/cta cursor-pointer shadow-none transition-all duration-300"
                          >
                            <div className="relative z-10 max-w-[280px]">
                              <h3
                                className="text-[32px] md:text-[36px] leading-[0.95] tracking-tighter text-white"
                                style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif", fontWeight: 600 }}
                              >
                                Fulfill requests <br /> & earn points.
                              </h3>
                            </div>

                            {/* Illustration: Guy with cards */}
                            <img
                              src="/illustrations/guy.png"
                              alt="Fulfill requests"
                              className="absolute bottom-0 left-0 w-full h-auto object-contain object-bottom pointer-events-none z-0"
                            />

                            {/* Decorative background pulse */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                          </div>
                        );
                      }

                      return null;
                    })()}
                    <div className="break-inside-avoid mb-6">
                      <RequestCard
                        request={request}
                        variant="detail"
                        images={requestWithExtras.images || []}
                        links={requestWithExtras.links || []}
                        smallImages={true}
                        noBorder={true}
                        priority={index < 3}
                      />
                    </div>
                  </Fragment>
                );
              })}
            </div>

            {/* Guest CTA Gradient Overlay */}
            {!user && isHomePage && (
              <div className="relative w-full -mt-64 z-20">
                <div className="absolute inset-x-0 bottom-0 h-[350px] bg-gradient-to-t from-white via-white/100 to-transparent pointer-events-none" />
                <div className="relative flex justify-center pb-24 pt-32">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-[#1e2330] text-white hover:bg-[#1e2330]/90 rounded-full font-semibold h-11 px-8 text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Sign up to explore
                  </button>
                </div>
              </div>
            )}

            {user && isHomePage && isFetchingNextPage && (
              <div className="w-full flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}

            </div>
          </>
        ) : null}
      </div>

      {showHero && (
        <div className="flex flex-col w-full bg-white relative z-30">
          {/* Why Onseek Section - High Vertical Padding, No border/rounded */}
          <section className="py-16 px-10 overflow-hidden">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-[40px] md:text-[56px] leading-[1.05] mb-6 text-[#1A1A1A] font-extrabold tracking-[-0.03em]" style={{ fontFamily: 'var(--font-expanded)' }}>
                What is Onseek?
              </h2>
              <p className="text-xl text-gray-400 font-medium max-w-3xl mx-auto mb-20 leading-relaxed">
                Onseek is a reverse marketplace where buyers state exactly what they need, and sellers compete to offer the best matches. It cuts through the noise of traditional searching.
              </p>

              <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
                <div className="flex flex-col items-center group">
                  <div className="w-32 h-32 mb-8 overflow-hidden">
                    <img src="/illustrations/onseek_magnet_purple.png" alt="Sellers come to you" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-3xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Sellers come to you</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">
                    Define your budget and skip the search. We’ve eliminated the friction of traditional marketplaces by making sellers apply to you.
                  </p>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-32 h-32 mb-8 overflow-hidden">
                    <img src="/illustrations/onseek_flower_purple.png" alt="Skip the scroll" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-3xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Skip the scroll</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">
                    Your time is valuable. Our request-first model eliminates the friction of traditional marketplaces. Post once, let sellers find you.
                  </p>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-32 h-32 mb-8 overflow-hidden">
                    <img src="/illustrations/onseek_city_purple.png" alt="Vetted sellers only" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-3xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Marketplace Integrity</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-base md:text-lg">
                    Through active community inputs and smart moderation, we maintain a marketplace of quality proposals where the best sellers rise to the top.
                  </p>
                </div>
              </div>
            </div>
          </section>



          <div className="w-full bg-transparent py-16">
            <div className="max-w-[1280px] mx-auto w-full px-4 md:px-6">
              <FaqSection />
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="max-w-[1280px] mx-auto w-full px-4 md:px-6 mb-24 mt-16">
            <div className="w-full bg-[#6925DC] rounded-[32px] py-20 px-8 text-center shadow-none flex flex-col items-center justify-center gap-6 overflow-hidden relative">
              <p className="relative z-10 text-white/60 text-[13px] font-bold tracking-[0.15em] uppercase">Physical product or digital service</p>
              <h2 className="relative z-10 text-white text-[32px] md:text-[48px] tracking-tight font-black max-w-2xl leading-[1.05]" style={{ fontFamily: 'var(--font-expanded)' }}>
                One request.<br />Endless possibilities.
              </h2>
              <p className="relative z-10 text-white/70 text-lg font-medium max-w-xl">
                Same box. Any category. The market delivers.
              </p>
              <Button asChild className="relative z-10 bg-white text-[#6925DC] hover:bg-white/90 border-0 rounded-full h-14 px-10 text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-none mt-4">
                <Link href="/signup">Start requesting</Link>
              </Button>
            </div>
          </div>

          <div className="mt-auto">
            <PublicFooter />
          </div>
        </div>
      )}
      {isAuthModalOpen && (
        <AuthModal
          open={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          title="Sell your items to the world"
          description="Sign in or create an account to start selling and track your inventory on Onseek."
        />
      )}
      {isAIFlowOpen && (
        <AIRequestFlow
          initialText={searchValue}
          onClose={() => {
            setIsAIFlowOpen(false);
            setSearchValue("");
          }}
          user={user}
          profile={profile}
        />
      )}
    </div>
  );
}

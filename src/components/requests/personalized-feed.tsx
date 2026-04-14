"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Fragment } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPreferencesAction } from "@/actions/preference.actions";
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
import { Loader2, Search, ChevronRight } from "lucide-react";
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

    if (mode === "for_you" && !hasPreferences) {
      if (currentMode !== "latest") {
        if (currentMode === "for_you") {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("mode");
          hasUpdatedUrlRef.current = true;
          const queryStr = params.toString();
          router.replace(queryStr ? `?${queryStr}` : window.location.pathname, { scroll: false });
        }
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
      const limit = isHomePage ? 16 : 20;

      // Import the action dynamically to avoid top-level issues if any
      const { getPersonalizedFeedAction } = await import("@/actions/preference.actions");

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

  const handleModeChange = (newMode: FeedMode) => {
    setMode(newMode);

    // Build path based on new mode and current category
    const modePath = REVERSE_MODE_MAP[newMode] || "for-you";
    const categoryPath = category && category !== "All" ? `/${getCategorySlug(category)}` : "";

    router.push(`/${modePath}${categoryPath}`);
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
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage, user, isHomePage]);




  return (
    <div className="flex flex-col w-full">
      {showHero && (
        <>
          <HeroSectionV2
            user={user}
            tradeMode={tradeMode}
            setTradeMode={setTradeMode}
          />
          {/* Announcement Bar removed as requested */}
        </>
      )}

      <div className={cn("mx-auto w-full px-4 md:px-6", !user && "max-w-[1360px]")}>
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
        <div className="py-2 min-h-[70px] flex flex-col justify-center mb-6 bg-white transition-all duration-300">
          <div className="mx-auto w-full text-center flex flex-col items-center relative z-10 w-full px-0">
            <div className="w-full flex flex-col items-stretch">
              <CategoryPills
                mode={mode}
                hasPreferences={hasPreferences}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                hideViewToggle={true}
                hideFilters={true}
              />
            </div>
          </div>
        </div>

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
          <div className="relative group w-full flex flex-col text-left">
            {/* Show subtle loading indicator while fetching */}
            {isFetching && !isLoading && (
              <div className="absolute top-0 left-0 right-0 z-20 flex justify-center py-2 pointer-events-none">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}

            <div className={cn("pb-4 w-full", viewMode === "grid" ? "columns-[360px] gap-6" : "flex flex-col gap-4 max-w-2xl mx-auto")}>
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
                  <Fragment key={request.id}>
                    {/* Brand CTA Card injected after some items */}
            {/* Select a random illustration for the CTA card */}
            {(() => {
              const illustrations = ["onseek_magnet_purple.png", "onseek_flower_purple.png", "onseek_city_purple.png"];
              const randomIll = illustrations[index % illustrations.length]; // Use index to keep it stable but different across the feed
              
              return index === 2 && (
                <div 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-create-request-modal'))}
                  className="break-inside-avoid mb-6 aspect-square rounded-[32px] bg-[#FDF9ED] p-8 flex flex-col justify-between text-[#1A1A1A] relative overflow-hidden group/cta cursor-pointer shadow-none transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Random illustration as background element */}
                  <div className="absolute top-1/2 -translate-y-1/2 -right-12 w-48 h-48 opacity-[0.08] pointer-events-none group-hover/cta:scale-110 transition-transform duration-500">
                    <img src={`/illustrations/${randomIll}`} alt="" className="w-full h-full object-contain" />
                  </div>
                  
                  {/* Abstract background decor */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#6925DC]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#6925DC]/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 mt-2">
                    <h3 className="text-[28px] md:text-[32px] font-semibold leading-[1.1] mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                      Can&apos;t find it?<br/>Request it.
                    </h3>
                    <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-[220px]">
                      Describe what you need and let our sellers find you.
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex justify-end">
                     <div className="bg-[#1A1A1A] text-white w-12 h-12 rounded-2xl flex items-center justify-center group-hover/cta:scale-110 transition-all shadow-md">
                       <ChevronRight className="w-6 h-6" strokeWidth={3} />
                     </div>
                  </div>
                </div>
              );
            })()}
                    <div className="break-inside-avoid mb-6 transition-all duration-300 ease-out hover:scale-[1.02]">
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

            {/* Bottom CTA for guests - integrated to overlap masonry */}
            {!user && isHomePage && (
              <div className="relative w-full -mt-64 z-20">
                <div className="absolute inset-x-0 bottom-0 h-[350px] bg-gradient-to-t from-white via-white/100 to-transparent pointer-events-none" />
                <div className="relative flex justify-center pb-24 pt-32">
                  <Button
                    onClick={() => router.push("/signup")}
                    variant="accent"
                    className="rounded-full font-semibold h-11 px-8 text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Sign up to explore
                  </Button>
                </div>
              </div>
            )}

            {user && isHomePage && isFetchingNextPage && (
              <div className="w-full flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}

          </div>
        ) : null}
      </div>

      {showHero && (
        <div className="flex flex-col w-full bg-white relative z-30">
          {/* Why Onseek Section - High Vertical Padding, No border/rounded */}
          <section className="py-16 px-10 overflow-hidden">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-[40px] md:text-[56px] leading-[1.05] mb-6 text-[#1A1A1A] font-extrabold tracking-[-0.03em]" style={{ fontFamily: 'var(--font-expanded)' }}>
                Why Onseek?
              </h2>
              <p className="text-xl text-gray-400 font-medium max-w-3xl mx-auto mb-20 leading-relaxed">
                We&apos;re built for people who value their time. Post a Request, set your budget, <br className="hidden md:block" />
                and we&apos;ll help you find exactly what you&apos;re looking for by bringing the market to you.
              </p>

              <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
                <div className="flex flex-col items-center group">
                  <div className="w-32 h-32 mb-8 overflow-hidden rounded-3xl">
                    <img src="/illustrations/onseek_magnet_purple.png" alt="Sellers Compete" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Sellers compete for you</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">
                    Instead of hunting for prices, you set your own budget and let verified sellers send you their best offers directly.
                  </p>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-32 h-32 mb-8 overflow-hidden rounded-3xl">
                    <img src="/illustrations/onseek_flower_purple.png" alt="Protect your peace" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Protect your peace</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">
                    Your time is valuable. Our request-first model eliminates the friction of traditional marketplaces, letting you focus on what matters.
                  </p>
                </div>

                <div className="flex flex-col items-center group">
                  <div className="w-32 h-32 mb-8 overflow-hidden rounded-3xl">
                    <img src="/illustrations/onseek_city_purple.png" alt="Verified Marketplace" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Verified marketplace</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">
                    Every provider on Onseek is manually vetted to ensure quality, reliability, and a completely secure transaction experience.
                  </p>
                </div>
              </div>
            </div>
          </section>



          <div className="w-full bg-transparent py-16">
            <div className="max-w-[1360px] mx-auto w-full px-4 md:px-6">
              <FaqSection />
            </div>
          </div>

          {/* New Freelancer CTA */}
          <div className="max-w-[1280px] mx-auto w-full px-4 md:px-6 mb-24 mt-16">
            <div className="w-full bg-[#6925DC] rounded-[32px] py-20 px-8 text-center shadow-none flex flex-col items-center justify-center gap-10 overflow-hidden relative">
              <h2 className="relative z-10 text-white text-[32px] md:text-[48px] tracking-tight font-black max-w-3xl leading-[1.1]" style={{ fontFamily: 'var(--font-expanded)' }}>
                Find freelancers who can help you build what's next
              </h2>
              <Button asChild className="relative z-10 bg-white text-[#6925DC] hover:bg-white/90 border-0 rounded-full h-14 px-10 text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-none">
                <Link href="/popular">Explore freelancers</Link>
              </Button>
            </div>
          </div>

          <PublicFooter />
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
    </div>
  );
}

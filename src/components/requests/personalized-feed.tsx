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
import Image from "next/image";
import { MAIN_CATEGORIES } from "@/lib/categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconLoader2,
  IconSearch,
  IconChevronRight,
  IconSparkles,
  IconFilter2,
  IconLayoutList,
  IconLayoutGrid,
  IconArrowRight,
  IconX,
  IconBrandInstagram,
  IconChevronDown,
  IconUser
} from "@tabler/icons-react";
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
import { LandingModal } from "@/components/landing/landing-modal";

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
  tagSlug?: string | null;
  hideFilters?: boolean;
}

export function PersonalizedFeed({
  initialMode = "for_you",
  initialCategory = null,
  initialData,
  tagSlug = null,
  hideFilters = false
}: PersonalizedFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [isHeroDismissed, setIsHeroDismissed] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const isHomePage = pathname === "/" || pathname.startsWith("/requests/");
  const showHero = (pathname === "/" || pathname === "/") && !user && !isHeroDismissed;

  useEffect(() => {
    if (showHero && !user) {
      document.body.classList.add('hero-modal-open');
    } else {
      document.body.classList.remove('hero-modal-open');
    }
    return () => document.body.classList.remove('hero-modal-open');
  }, [showHero, user]);

  const [mode, setMode] = useState<FeedMode>(() => {
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
  const [modalScrolled, setModalScrolled] = useState(false);
  const [showCategoryStrip, setShowCategoryStrip] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at the very top
      if (currentScrollY < 100) {
        setShowCategoryStrip(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Detect scroll direction
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setShowCategoryStrip(false);
      } else {
        // Scrolling up
        setShowCategoryStrip(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = modalScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      setModalScrolled(container.scrollTop > 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [showHero]);

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

  useEffect(() => {
    const handleOpenLanding = () => {
      setIsHeroDismissed(false);
    };
    window.addEventListener("open-landing-modal", handleOpenLanding);
    return () => window.removeEventListener("open-landing-modal", handleOpenLanding);
  }, []);

  useEffect(() => {
    if (showHero) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsHeroDismissed(true);
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [showHero]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [searchValue]);

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
          setHasPreferences(false);
        }
      } catch (err) {
        console.warn("Could not load preferences:", err);
        setHasPreferences(false);
      }
    }
    loadPreferences();
  }, []);

  useEffect(() => {
    if (hasPreferences === undefined) return;
    if (mode === "for_you" && !hasPreferences) {
      setMode("latest");
    }
  }, [mode, hasPreferences]);

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
    queryKey: ["personalized-feed", user?.id, mode, category, priceMin, priceMax, country, sort, tagSlug],
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
          tagSlug,
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
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    initialData: initialData ? { pages: [initialData], pageParams: [undefined] } : undefined,
    placeholderData: (previousData) => previousData,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const allItems = useMemo(() => {
    if (!data || !data.pages) return [];
    let items = data.pages.flatMap((page) => page?.items || []);

    if (mounted && typeof window !== "undefined") {
      try {
        const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
        items = items.filter((item: RequestItem) => !hidden.includes(item.id));
      } catch (error) {
        console.error("Error reading hidden requests:", error);
      }
    }
    return items;
  }, [data, mounted]);

  useEffect(() => {
    const handleScroll = () => {
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
      <LandingModal
        open={showHero}
        onOpenChange={(open) => setIsHeroDismissed(!open)}
      />

      <div className={cn(
        "w-full px-3 md:px-8",
        !user && isHomePage
          ? "pt-14 md:pt-20"
          : "pt-16 md:pt-0"
      )}>
        {/* Category Pill Navigation */}
        {(user || category || isHomePage) && !hideFilters && (
          <div className="z-[40] bg-white w-full relative">
            <div className="w-full px-0 py-2 min-h-[70px] flex flex-col justify-center bg-white">
              <div className="w-full flex flex-col items-stretch relative z-10">
                <CategoryPills
                  mode={mode}
                  leftElement={(
                    <FiltersModal
                      open={filtersOpen}
                      onOpenChange={setFiltersOpen}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      sortMode={mode === "for_you" ? "latest" : mode}
                      onSortModeChange={handleModeChange}
                    >
                      <button className="w-9 h-9 flex items-center justify-center rounded-full border shrink-0 bg-white border-gray-200">
                        <IconFilter2 className="h-4 w-4" />
                      </button>
                    </FiltersModal>
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Discovery Header Block - Hidden on Home Page */}
        {(user || category) && !hideFilters && !isHomePage && (
          <div className="flex flex-col mb-12 mt-10">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-6" style={{ fontFamily: 'var(--font-expanded)' }}>
              {category ? `${category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Requests` : "Discover"}
            </h1>
            <p className="text-[#1A1A1A] text-xl font-medium max-w-2xl leading-snug">
              {category
                ? `Discover what seekers are looking for in ${category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}.`
                : (user ? "Personalized selection just for you" : "Standout requests making waves around the platform")
              }
            </p>
          </div>
        )}

        {/* Main Feed Content */}
        {isLoading && allItems.length === 0 ? (
          <AppLoading />
        ) : isError ? (
          <div className="py-12 text-center text-gray-500">Failed to load feed. <Button onClick={() => refetch()} variant="ghost">Retry</Button></div>
        ) : (
          <div className="relative w-full">
            <div className={cn(
              "pb-12 w-full relative transition-all duration-300",
              isFetching && !isLoading ? "opacity-40 blur-[1px]" : "opacity-100",
              viewMode === "grid" ? "columns-[360px] gap-6" : "flex flex-col gap-4 max-w-2xl mx-auto"
            )}>
              {/* AI Request Box - Now visible for everyone on Home Page */}
              {isHomePage && (
                <div className="break-inside-avoid mb-6">
                  <div className="w-full rounded-[24px] bg-white border border-[#e6e7eb] p-5 shadow-none">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center h-10 w-10 mt-1 rounded-full bg-gray-50 shrink-0 overflow-hidden border border-gray-100">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          user ? (
                            <IconSparkles className="w-5 h-5 text-gray-300" />
                          ) : (
                            <IconUser className="w-5 h-5 text-gray-300" />
                          )
                        )}
                      </div>
                      <textarea
                        ref={textareaRef}
                        placeholder="Describe what you are looking for..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-[#1A1A1A] placeholder:text-[#a5abb7] text-[18px] font-medium resize-none leading-relaxed"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={() => setIsAIFlowOpen(true)} className="h-10 px-6 gap-2 bg-[#1A1A1A] hover:bg-black text-white rounded-full font-bold shadow-none">
                        <span>Post</span>
                        <IconArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {allItems.map((request, index) => {
                const requestWithExtras = request as RequestItem & { images?: string[]; links?: string[] };
                return (
                  <div key={request.id} className="break-inside-avoid mb-6">
                    <RequestCard
                      request={request}
                      variant="detail"
                      images={requestWithExtras.images || []}
                      links={requestWithExtras.links || []}
                      smallImages={true}
                      noBorder={true}
                      isMasonry={true}
                    />
                  </div>
                );
              })}
            </div>

            {(isFetchingNextPage) && (
              <div className="w-full flex justify-center py-12">
                <IconLoader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        )}
      </div>

      {isAuthModalOpen && (
        <AuthModal
          open={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          title="Join the Onseek community"
          description="Start requesting or searching for items around the world."
        />
      )}
      {isAIFlowOpen && (
        <AIRequestFlow
          initialText={searchValue}
          onClose={() => setIsAIFlowOpen(false)}
          user={user}
          profile={profile}
        />
      )}
    </div>
  );
}

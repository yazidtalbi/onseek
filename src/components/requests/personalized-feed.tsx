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
import { Loader2, Search, ChevronRight, Sparkles, ListFilter, Rows3, LayoutGrid, ArrowRight, X, Instagram, ChevronDown, User } from "lucide-react";
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
  const isHomePage = pathname === "/" || pathname === "/" || pathname.startsWith("/requests/");
  const showHero = (pathname === "/" || pathname === "/") && !user && !isHeroDismissed;

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
      {showHero && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsHeroDismissed(true);
            }
          }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#2D00AC]/20 p-4 md:p-12"
        >
          {/* Modal + Footer Wrapper */}
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsHeroDismissed(true);
              }
            }}
            className="relative w-full max-w-[768px] flex flex-col gap-6 py-12"
          >
            {/* Floating Close Button */}
            <button
              onClick={() => setIsHeroDismissed(true)}
              className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 group transition-all hover:scale-110 z-[140]"
            >
              <X className="w-5 h-5 text-[#6925DC] transition-transform group-hover:rotate-90" />
            </button>

            {/* Modal Body with overflow hidden */}
            <div className="relative w-full bg-[#6925dc] rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col">
              {/* Modal Header */}
              <div className="sticky top-0 z-[110] w-full h-24 bg-transparent flex items-center justify-between px-12">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-pointer group outline-none">
                          <span className="text-[15px] font-bold text-white hover:text-white/80 transition-all" style={{ fontFamily: 'var(--font-expanded)' }}>Explore</span>
                          <ChevronDown className="w-4 h-4 text-white transition-transform group-hover:translate-y-0.5" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 bg-white rounded-2xl p-2 shadow-xl border-gray-100 z-[160]">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {MAIN_CATEGORIES.map((cat) => (
                            <DropdownMenuItem
                              key={cat}
                              className="text-[14px] font-bold text-gray-700 hover:text-[#6925DC] hover:bg-purple-50 rounded-xl cursor-not-allowed transition-colors py-2.5 px-4"
                              style={{ fontFamily: 'var(--font-expanded)' }}
                            >
                              {cat}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link href="/about" className="text-[15px] font-bold text-white hover:text-white/80 transition-all" style={{ fontFamily: 'var(--font-expanded)' }}>About</Link>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold px-5 border-white/10 shadow-none h-11 flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-expanded)' }}
                    onClick={() => setIsHeroDismissed(true)}
                  >
                    <Image
                      src="/logonseek.svg"
                      alt=""
                      width={18}
                      height={18}
                      className="brightness-0 invert opacity-80"
                    />
                    <span>{modalScrolled ? "Sign up" : "Log in"}</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col w-full">
                <HeroSectionV2
                  user={user}
                  profile={profile}
                  tradeMode={tradeMode}
                  setTradeMode={setTradeMode}
                />
                <AnnouncementBar />

                <div className="flex flex-col w-full bg-white relative">
                  <section className="py-12 md:py-20 px-6 md:px-12 overflow-hidden min-h-[60vh] flex flex-col items-center">
                    <div className="w-full text-center max-w-2xl mx-auto">
                      <h2 className="text-[32px] md:text-[40px] leading-[1.1] mb-6 text-[#1A1A1A] font-black tracking-[-0.02em] mx-auto" style={{ fontFamily: 'var(--font-expanded)' }}>
                        What is Onseek?
                      </h2>
                      <p className="text-lg text-gray-400 font-medium mb-12 md:mb-16 leading-relaxed mx-auto max-w-md">
                        Onseek is a reverse marketplace where buyers state exactly what they need, and sellers compete to offer the best matches.
                      </p>
                    </div>

                    <div className="flex flex-col gap-16 max-w-2xl py-10">
                      {/* Feature 1 */}
                      <div className="flex items-center gap-8 group text-left">
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden">
                          <img src="/illustrations/onseek_magnet_purple.png" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Sellers come to you</h3>
                          <p className="text-base text-gray-400 font-medium leading-relaxed">
                            Define your budget and skip the search. We’ve eliminated the friction of traditional marketplaces by making sellers apply to you.
                          </p>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div className="flex items-center gap-8 group text-left">
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden">
                          <img src="/illustrations/onseek_flower_purple.png" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Skip the scroll</h3>
                          <p className="text-base text-gray-400 font-medium leading-relaxed">
                            Your time is valuable. Our request-first model eliminates the friction of traditional marketplaces. Post once, let sellers find you.
                          </p>
                        </div>
                      </div>

                      {/* Feature 3 */}
                      <div className="flex items-center gap-8 group text-left">
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden">
                          <img src="/illustrations/onseek_city_purple.png" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Marketplace Integrity</h3>
                          <p className="text-base text-gray-400 font-medium leading-relaxed">
                            Through active community inputs and smart moderation, we maintain a marketplace of quality proposals where the best sellers rise to the top.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="w-full bg-transparent pb-12 pt-0">
                    <div className="w-full px-4 md:px-6">
                      <FaqSection />
                    </div>
                  </div>

                  <div className="w-full px-4 md:px-6 mb-6 mt-4">
                    <div className="w-full bg-[#6925DC] rounded-[24px] py-16 px-6 text-center flex flex-col items-center justify-center gap-6 overflow-hidden relative">
                      <h2 className="relative z-10 text-white text-[24px] md:text-[32px] tracking-tight font-bold leading-tight max-w-md" style={{ fontFamily: 'var(--font-expanded)' }}>
                        Join thousands and discover the new era of shopping
                      </h2>
                      <Button asChild size="lg" className="relative z-10 h-14 px-10 rounded-full bg-white text-[#6925DC] hover:bg-white/90 text-[16px] font-bold mt-4 shadow-none">
                        <Link href="/signup">Join the community</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Section */}
            <div className="w-full bg-[#1A1A1A] rounded-[32px] p-8 md:p-12 flex flex-col gap-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {/* Logo & Intro */}
                <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                  <Image
                    src="/logonseek.svg"
                    alt="Onseek"
                    width={32}
                    height={32}
                    className="brightness-0 invert opacity-90"
                  />
                </div>

                {/* Product & Resources Column */}
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/40">Product</h4>
                    <nav className="flex flex-col gap-2.5">
                      <Link href="/discover" className="text-sm text-white/70 hover:text-white transition-colors">Discover</Link>
                      <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">About Us</Link>
                      <Link href="/feedback" className="text-sm text-white/70 hover:text-white transition-colors">Feedback</Link>
                    </nav>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/40">Resources</h4>
                    <nav className="flex flex-col gap-2.5">
                      <Link href="/help" className="text-sm text-white/70 hover:text-white transition-colors">Help Center</Link>
                      <Link href="/trust" className="text-sm text-white/70 hover:text-white transition-colors">Trust & Safety</Link>
                    </nav>
                  </div>
                </div>

                {/* Categories Column 1 */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/40">Categories</h4>
                  <nav className="flex flex-col gap-2">
                    {MAIN_CATEGORIES.slice(0, 8).map((category) => (
                      <Link
                        key={category}
                        href={`/latest/${getCategorySlug(category)}`}
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Categories Column 2 */}
                <div className="flex flex-col gap-3 pt-[28px] md:pt-[32px]">
                  <nav className="flex flex-col gap-2">
                    {MAIN_CATEGORIES.slice(8).map((category) => (
                      <Link
                        key={category}
                        href={`/latest/${getCategorySlug(category)}`}
                        className="text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-8 border-t border-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-white/40 font-medium">© 2026 onseek</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex gap-4">
                    <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">Privacy</Link>
                    <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">Terms</Link>
                    <Link href="/cookies" className="text-sm text-white/70 hover:text-white transition-colors">Cookies</Link>
                  </div>
                  <div className="flex gap-4 items-center">
                    <a href="https://instagram.com/onseek.co" target="_blank" className="text-white hover:text-white/80 transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        "w-full px-3 md:px-8",
        !user && isHomePage
          ? "pt-20 sm:pt-24"
          : (pathname === "/" ? "pt-2 sm:pt-4" : "pt-0 sm:pt-4")
      )}>
        {/* Category Pill Navigation */}
        {(user || category) && !hideFilters && (
          <div className="py-2 min-h-[70px] flex flex-col justify-center mb-2 md:mb-6 bg-white">
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
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border md:hidden shrink-0 bg-white border-gray-200">
                      <ListFilter className="h-4 w-4" />
                    </button>
                  </FiltersModal>
                )}
              />
            </div>
          </div>
        )}

        {/* Discovery Header Block */}
        {(user || category) && !hideFilters && (
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl md:text-3xl font-semibold text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-expanded)' }}>
                  {category ? `${category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Requests` : "Discover"}
                </h3>
                <p className="text-sm md:text-base text-gray-400 font-medium">
                  {user ? "Personalized selection just for you" : "Standout requests making waves around the platform"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setFiltersOpen(!filtersOpen)} className="hidden md:flex w-9 h-9 items-center justify-center rounded-full border bg-white border-gray-200">
                  <ListFilter className="h-4 w-4" />
                </button>
                <div className="hidden md:block">
                  <Select value={mode === "for_you" ? "latest" : mode} onValueChange={handleModeChange}>
                    <SelectTrigger className="px-3 py-2 rounded-full text-sm font-medium border-transparent bg-white h-9 focus:ring-0 w-auto shadow-none">
                      <span>{mode === "trending" ? "Trending" : "Latest"}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white"><SelectItem value="latest">Latest</SelectItem><SelectItem value="trending">Trending</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>
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
                            <Sparkles className="w-5 h-5 text-gray-300" />
                          ) : (
                            <User className="w-5 h-5 text-gray-300" />
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
                        <ArrowRight className="h-4 w-4" />
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
                    />
                  </div>
                );
              })}
            </div>

            {(isFetchingNextPage) && (
              <div className="w-full flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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

"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Menu,
  Bell,
  Search,
  Plus,
  Compass,
  LayoutGrid,
  Settings,
  User,
  LogOut,
  ChevronDown,
  MessageCircle,
  HelpCircle,
  Shield,
  CirclePlay,
  FileText,
  X,
  TrendingUp,
  Sparkles,
  Moon,
  Sun,
  Bookmark,
  Send,
  ClipboardList,
  Package,
  Package2,
  Home,
  Trophy,
  MessageCircleMore,
  SquarePlus,
  Binoculars,
  Check,
  Globe as GlobeIcon
} from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";
import { useTheme } from "@/components/layout/theme-provider";
import { useSidebar } from "@/components/layout/app-sidebar";
import { signOutAction } from "@/actions/auth.actions";
import { LoginDropdown } from "@/components/auth/login-dropdown";
import { CreateRequestModal } from "@/components/requests/create-request-modal";
import { AIRequestModal } from "@/components/requests/ai-request-modal";
import { NotificationsDrawer } from "@/components/notifications/notifications-drawer";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
  BottomSheetClose,
} from "@/components/ui/bottom-sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import * as React from "react";
// @ts-ignore - react-select-country-list doesn't have type definitions
import countryListFactory from "react-select-country-list";
import Image from "next/image";
const categories = MAIN_CATEGORIES;

// Initialize country list
const countryList = countryListFactory();
const countryLabels: string[] = countryList.getLabels();

// Popular countries to show at the top
const POPULAR_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Norway",
  "Denmark",
  "Belgium",
];

// Get country code from country name
function getCountryCode(countryName: string): string | null {
  try {
    const code = countryList.getValueByLabel(countryName);
    return code ? code.toUpperCase() : null;
  } catch {
    return null;
  }
}

// Mobile Country Selector Component
function MobileCountrySelector({ onSelect }: { onSelect: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCountry = searchParams.get("country") || null;
  const [searchQuery, setSearchQuery] = React.useState("");

  const { popularCountries, otherCountries } = React.useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const allFiltered = searchQuery
      ? countryLabels.filter((country) =>
        country.toLowerCase().includes(lowerQuery)
      )
      : countryLabels;

    const popular = allFiltered.filter((country) =>
      POPULAR_COUNTRIES.includes(country)
    );
    const other = allFiltered.filter(
      (country) => !POPULAR_COUNTRIES.includes(country)
    );

    return { popularCountries: popular, otherCountries: other };
  }, [searchQuery]);

  const handleSelectCountry = (country: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (country === selectedCountry || country === "") {
      params.delete("country");
    } else {
      params.set("country", country);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
    onSelect();
  };

  const hasResults = popularCountries.length > 0 || otherCountries.length > 0;

  const renderCountryItem = (country: string) => {
    const countryCode = getCountryCode(country);
    const isSelected = selectedCountry === country;
    return (
      <button
        key={country}
        type="button"
        onClick={() => handleSelectCountry(country)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
          "hover:bg-gray-100 cursor-pointer",
          isSelected && "bg-gray-100"
        )}
      >
        {countryCode ? (
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center overflow-hidden rounded-sm border border-gray-200">
            <Image
              src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
              alt={country}
              width={20}
              height={15}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <GlobeIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
        )}
        <span className="flex-1 text-left">{country}</span>
        <Check
          className={cn(
            "h-4 w-4 flex-shrink-0",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search country..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-10"
      />
      <div className="max-h-64 overflow-y-auto space-y-0">
        {hasResults ? (
          <>
            <button
              type="button"
              onClick={() => handleSelectCountry("")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                "hover:bg-gray-100 cursor-pointer",
                !selectedCountry && "bg-gray-100"
              )}
            >
              <GlobeIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="flex-1 text-left">All Countries</span>
              <Check
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  !selectedCountry ? "opacity-100" : "opacity-0"
                )}
              />
            </button>
            {popularCountries.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Popular
                </div>
                {popularCountries.map(renderCountryItem)}
              </>
            )}
            {otherCountries.length > 0 && (
              <>
                {popularCountries.length > 0 && (
                  <div className="h-px bg-gray-200 my-1" />
                )}
                {!searchQuery && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    All Countries
                  </div>
                )}
                {otherCountries.map(renderCountryItem)}
              </>
            )}
          </>
        ) : (
          <div className="p-6 text-sm text-muted-foreground text-center">
            No countries found
          </div>
        )}
      </div>
    </div>
  );
}

export function AppNavbar({
  hideSearch = false,
  minimal = false,
  ctaText = "Sign Up"
}: {
  hideSearch?: boolean;
  minimal?: boolean;
  ctaText?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(!hideSearch);
  const [searchType, setSearchType] = useState<"requests" | "items">("requests");
  const [isPending, startTransition] = useTransition();
  const [unreadCount, setUnreadCount] = useState(0);
  // mobileOpen removed - using SidebarContext
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const isHomePage = pathname === "/";
  const { 
    mobileOpen, setMobileOpen,
    expanded: isSidebarExpanded, setExpanded: setSidebarSidebarExpanded 
  } = useSidebar();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");


  useEffect(() => {
    const handler = setTimeout(() => {
      const currentParam = searchParams.get("q") || "";
      if (searchQuery !== currentParam) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
          params.set("q", searchQuery);
          params.delete("page");
          router.push(`/search?${params.toString()}`);
        } else if (currentParam) {
          params.delete("q");
          params.delete("page");
          router.push(`/search?${params.toString()}`);
        }
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, searchParams, router]);
  useEffect(() => {
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    window.addEventListener('open-create-request-modal', handleOpenCreateModal);

    // Fallback for direct URL access
    if (searchParams.get("new") === "true") {
      setIsCreateModalOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }

    return () => window.removeEventListener('open-create-request-modal', handleOpenCreateModal);
  }, [searchParams, pathname, router]);

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();

      // Force hard refresh to root
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems: { href: string; label: string }[] = [];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  const handleCategorySelect = (category: string) => {
    if (category === "All") {
      router.push("/popular");
    } else {
      const { getCategorySlug } = require("@/lib/utils/category-routing");
      const slug = getCategorySlug(category);
      router.push(`/popular/${slug}`);
    }
  };

  // Fetch unread notification count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Set up real-time subscription for notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Detect when hero section is out of view on home page
  useEffect(() => {
    if (hideSearch) {
      setShowSearch(false);
      return;
    }
    if (!isHomePage) {
      setShowSearch(true);
      return;
    }

    const heroSection = document.getElementById("onseek-hero");
    if (!heroSection) {
      setShowSearch(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Show search when hero section is not visible
        setShowSearch(!entries[0].isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px", // Show only when hero is completely out of view
      }
    );

    observer.observe(heroSection);

    return () => {
      observer.disconnect();
    };
  }, [isHomePage]);

  const [avatarError, setAvatarError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
        
        // Hide on scroll down, show on scroll up (only for guest users)
        if (!user && currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-white h-20",
      !isVisible && "-translate-y-full"
    )}>
      {/* Mobile Navbar Container */}
      <div className={cn(
        "md:hidden flex flex-col w-full relative z-20 transition-all duration-300",
        isScrolled ? "bg-white" : "bg-transparent"
      )}>
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 px-4 w-full">
          {user ? (
            <>
              {/* Left: Hamburger, Logo */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-9 w-9 -ml-2" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <Link href="/" prefetch={true} className="shrink-0 flex items-center gap-2">
                  <Image src="/logo-final.svg" alt="onseek" width={24} height={24} className="h-6 w-auto" priority />
                  <span className="text-lg text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>onseek</span>
                </Link>
              </div>

              {/* Right: Messages, Alert, Avatar */}
              <div className="flex items-center gap-2">
                <Link href="/messages" className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100 transition-colors">
                  <MessageCircle className="h-5 w-5 text-gray-700" />
                </Link>
                {mounted ? (
                  <>
                    <NotificationsDrawer>
                      <Button variant="ghost" size="icon" className="relative h-9 w-9" suppressHydrationWarning>
                        <Bell className="h-5 w-5 text-gray-700" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[#7755FF] text-white text-[9px] font-semibold flex items-center justify-center shrink-0">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </NotificationsDrawer>
                    <Link href={profile?.username ? `/profile/${profile.username}` : "/settings"} className="ml-1 flex items-center gap-2 pr-1">
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[80px]">
                        {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.username}
                      </span>
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs overflow-hidden border border-gray-200 shrink-0">
                        {profile?.avatar_url && !avatarError ? (
                          <img src={profile.avatar_url} alt={profile.username || "User"} className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                        ) : (
                          (profile?.first_name?.charAt(0) || profile?.username?.charAt(0) || "U").toUpperCase()
                        )}
                      </div>
                    </Link>
                  </>
                ) : (
                  <div className="h-9 w-12" />
                )}
              </div>
            </>
          ) : (
            <>
              {/* Guest Layout */}
              {/* Left: Logo */}
              <Link href="/" prefetch={true} className="shrink-0 flex items-center gap-2">
                <Image src="/logo-final.svg" alt="Onseek" width={24} height={24} className="h-6 w-auto" priority />
                <span className="text-lg text-[#6925DC]" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>onseek</span>
              </Link>

              {/* Right: Plus, Hamburger */}
              <div className="flex items-center gap-2">
                {!minimal && (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAIModalOpen(true)} size="icon" className="h-9 w-9 rounded-full bg-slate-50 text-[#6925DC] hover:bg-slate-100 border border-[#6925DC]/10">
                      <Sparkles className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)} size="icon" className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">
                      <SquarePlus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Button variant="ghost" size="icon" className="h-9 w-9 ml-1 -mr-2" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Sticky Search bar beneath top bar */}
        {user && (
          <div className="px-4 pb-3 pt-1 w-full relative z-10 bg-white">
            <form action="/search" method="get" className="relative w-full flex items-center">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" placeholder="Search..." defaultValue={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 bg-gray-100 border-transparent rounded-full h-10 w-full text-sm focus-visible:ring-1 focus-visible:ring-gray-300 transition-shadow" />
              <input type="hidden" name="type" value={searchType} />
            </form>
          </div>
        )}
      </div>

      {/* Redundant Mobile Sheet Handled by AppSidebar */}

      {/* Desktop Navbar - Fixed Full Width */}
      <div className={cn(
        "hidden md:flex w-full h-20 items-center relative transition-all duration-300 pr-8 bg-white",
      )}>
        {/* Left Side: Sidebar Toggle & Logo */}
        <div className="flex items-center shrink-0">
          <div className="absolute left-0 top-0 bottom-0 w-[72px] flex items-center justify-center z-20">
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-gray-900 hover:bg-gray-100 rounded-xl"
                onClick={() => setSidebarSidebarExpanded(!isSidebarExpanded)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
          {user && <div className="w-[72px] shrink-0" />} {/* Spacer */}
          <Link href="/" className={cn("flex items-center gap-2 group", user ? "ml-6" : "ml-8")}>
            <div className="w-9 h-9 flex items-center justify-center">
              <Image src="/logo-final.svg" alt="onseek" width={28} height={28} className="h-7 w-auto" priority />
            </div>
            <span className="text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
              onseek
            </span>
          </Link>
        </div>

        {/* Center Side: Search Bar */}
        {user && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center w-full max-w-md justify-center z-10 pointer-events-none">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("q", searchQuery.trim());
                  params.delete("page");
                  router.push(`/search?${params.toString()}`);
                }
              }}
              className="w-full transition-all duration-300 pointer-events-auto"
            >
              <div className="relative flex items-center w-full bg-gray-50 border border-gray-100 rounded-full h-11 group focus-within:bg-white focus-within:border-[#6925DC]/20 transition-all">
                <Search className="absolute left-4 h-4 w-4 text-gray-400 group-focus-within:text-[#6925DC] transition-colors" strokeWidth={2.5} />
                <Input
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm h-full pl-11 pr-4 shadow-none placeholder:text-gray-400"
                />
              </div>
            </form>
          </div>
        )}

        {/* Right Side: Navigation & Actions */}
        <div className="flex items-center gap-6 ml-auto shrink-0 relative z-20">
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "text-[#7755FF]"
                      : "text-gray-600 hover:text-[#7755FF]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button 
                  onClick={() => setIsAIModalOpen(true)} 
                  className="hidden sm:flex h-11 rounded-full bg-transparent text-black font-bold whitespace-nowrap px-6 items-center gap-2 border border-black hover:bg-gray-50 shadow-none transition-all"
                >
                  <SquarePlus className="h-5 w-5 text-black" />
                  Request
                </Button>
                {mounted && (
                  <>
                    <NotificationsDrawer>
                      <Button variant="ghost" size="icon" className="relative" suppressHydrationWarning>
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#7755FF] text-white text-[10px] font-semibold flex items-center justify-center shadow-sm">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Button>
                    </NotificationsDrawer>
                    <div className="flex lg:hidden items-center">
                      <Button variant="ghost" size="icon" className="relative" onClick={() => setSearchSheetOpen(true)}>
                        <Search className="h-5 w-5" />
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 pl-3 pr-2 h-10 hover:bg-gray-50 rounded-full transition-colors outline-none shrink-0 group/nav">
                          <span className="text-sm font-bold text-[#1A1A1A] truncate max-w-[120px]">
                            {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.username}
                          </span>
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 font-bold text-xs shrink-0 overflow-hidden relative border border-gray-200">
                            {profile?.avatar_url && !avatarError ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.username || "User"}
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                              />
                            ) : (
                              (profile?.first_name?.charAt(0) || profile?.username?.charAt(0) || "U").toUpperCase()
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 group-hover/nav:text-gray-600 transition-colors" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2 bg-white shadow-lg border border-border mt-2">
                        <div className="flex items-center gap-3 p-2 mb-2">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 text-gray-700 font-bold text-sm shrink-0 overflow-hidden relative">
                            {profile?.avatar_url && !avatarError ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.username || "User"}
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                              />
                            ) : (
                              (profile?.first_name?.charAt(0) || profile?.username?.charAt(0) || "U").toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-neutral-900 truncate">
                              {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : (profile?.username || "Account")}
                            </span>
                            <span className="text-xs text-neutral-500 truncate">
                              View Profile
                            </span>
                          </div>
                        </div>
                        <DropdownMenuItem asChild>
                          <Link href={profile?.username ? `/profile/${profile.username}` : "/settings"} className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-neutral-50">
                            <User className="h-4 w-4" />
                            <span>My Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-neutral-50">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => startTransition(async () => { await signOutAction(); })}
                          className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-rose-50 text-rose-600 focus:text-rose-600 focus:bg-rose-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </>
            ) : (
              <>
                {!minimal && (
                  <div className="flex items-center gap-6 mr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-[#222222] hover:bg-gray-100 rounded-full transition-colors whitespace-nowrap"
                        >
                          Explore
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg overflow-y-auto max-h-[70vh] z-[100]">
                        <DropdownMenuItem onClick={() => router.push("/popular")} className="font-medium">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Popular
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/latest")} className="font-medium">
                          <Sparkles className="h-4 w-4 mr-2" />
                          New and Noteworthy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className="font-medium"
                          >
                            {category}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link href="/login" className="shrink-0">
                      <Button variant="ghost" className="h-11 rounded-full px-6 text-sm font-bold text-[#222222] hover:bg-gray-100">
                        Log In
                      </Button>
                    </Link>
                  </div>
                )}
                <Link href="/signup" className="shrink-0">
                  <Button variant="default" className="h-11 rounded-full px-8 bg-[#222234] text-white hover:bg-[#222234]/90 shrink-0 whitespace-nowrap text-sm font-bold">
                    {ctaText}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <CreateRequestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        userCountry={searchParams.get("country")}
      />
      <AIRequestModal
        open={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
      />
    </header>
  );
}


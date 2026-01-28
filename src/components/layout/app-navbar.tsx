"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, Plus, ChevronDown, TrendingUp, Sparkles, Moon, Sun, LogOut, Bookmark, User, Send, Settings, ClipboardList, Package, Menu, X, Home, Trophy, Globe } from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";
import { useTheme } from "@/components/layout/theme-provider";
import { signOutAction } from "@/actions/auth.actions";
import { LoginDropdown } from "@/components/auth/login-dropdown";
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
import { Check, Globe as GlobeIcon } from "lucide-react";

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
    router.push(`/app?${params.toString()}`);
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

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState<"requests" | "items">("requests");
  const [isPending, startTransition] = useTransition();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const isHomePage = pathname === "/";

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
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
      router.push("/");
    } else {
      // Map category names to URL slugs
      const slugMap: Record<string, string> = {
        "Tech": "tech",
        "Gaming": "gaming",
        "Fashion": "fashion",
        "Health & Cosmetics": "health-cosmetics",
        "Family & Children": "family-children",
        "Home & Living": "home-living",
        "Garden & DIY": "garden-diy",
        "Auto": "auto",
        "Grocery": "grocery",
      };
      const slug = slugMap[category] || category.toLowerCase();
      router.push(`/app/category/${slug}`);
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
    if (!isHomePage) {
      setShowSearch(true);
      return;
    }

    const heroSection = document.getElementById("hero-search-section");
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
        rootMargin: "-100px 0px 0px 0px", // Trigger slightly before completely out of view
      }
    );

    observer.observe(heroSection);

    return () => {
      observer.disconnect();
    };
  }, [isHomePage]);

  return (
    <header className="sticky top-0 z-20 w-full bg-white">
      {/* Mobile Navbar */}
      <div className="md:hidden flex items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link href="/app" prefetch={true} className="shrink-0 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="onseek"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span className="text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
            onseek
          </span>
        </Link>
        
        {/* Right side: Create Request, Search and Profile Menu */}
        <div className="flex items-center gap-2">
          {/* Create Request Button */}
          {user ? (
            <Button asChild size="icon" className="rounded-full bg-[#212733] text-white hover:bg-[#212733]/90">
              <Link href="/app/new">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="icon" className="rounded-full  text-[#212733] hover:bg-gray-50 border-0">
              <Link href="/signup">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {/* Search Icon - Opens Bottom Sheet */}
          <BottomSheet open={searchSheetOpen} onOpenChange={setSearchSheetOpen}>
            <BottomSheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Search className="h-5 w-5" />
              </Button>
            </BottomSheetTrigger>
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetTitle>Search</BottomSheetTitle>
              </BottomSheetHeader>
              <form action="/search" method="get" className="space-y-4 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Search..."
                    className="pl-9  border w-full"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-between">
                      {searchType === "requests" ? "Requests" : "Items"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setSearchType("requests")}>
                      <div className="flex flex-col">
                        <span className="font-medium">Requests</span>
                        <span className="text-xs text-muted-foreground">Search community requests</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSearchType("items")}>
                      <div className="flex flex-col">
                        <span className="font-medium">Items</span>
                        <span className="text-xs text-muted-foreground">Search products and items</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button type="submit" className="w-full bg-[#7755FF] hover:bg-[#6644EE]" onClick={() => setSearchSheetOpen(false)}>
                  Search
                </Button>
              </form>
            </BottomSheetContent>
          </BottomSheet>

          {/* Profile Image Menu - Opens Full Screen Modal */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-foreground font-medium text-sm hover:bg-gray-300 transition-colors">
                {user && profile ? (
                  profile.username?.charAt(0).toUpperCase() || "U"
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left" fullScreen={true} noBlur={true} className="w-full p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>

                {/* User Info Section */}
                {user && (
                  <div className="p-4 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-foreground font-medium">
                        {profile?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{profile?.username || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Explore Section with Accordion */}
                  <div className="border-b border-[#e5e7eb]">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="explore" className="border-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <span className="font-medium">Explore</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-4 pb-2 space-y-0.5">
                            <Link
                              href="/"
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                pathname === "/"
                                  ? "bg-gray-100 text-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                              )}
                            >
                              <TrendingUp className="h-5 w-5 shrink-0" />
                              Popular
                            </Link>
                            <Link
                              href="/?sort=newest"
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                              )}
                            >
                              <Sparkles className="h-5 w-5 shrink-0" />
                              New and Noteworthy
                            </Link>
                            {categories.map((category) => {
                              const categoryPath = `/app/category/${category.toLowerCase()}`;
                              const isActive = pathname === categoryPath;
                              return (
                                <Link
                                  key={category}
                                  href={categoryPath}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                    isActive
                                      ? "bg-gray-100 text-foreground font-medium"
                                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                                  )}
                                >
                                  {category}
                                </Link>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>


                  {/* Main Navigation */}
                  <nav className="space-y-1 p-4">
                    {user && (
                      <>
                        <Link
                          href="/app/requests"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            pathname === "/app/requests" || pathname.startsWith("/app/requests/")
                              ? "bg-gray-100 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          )}
                        >
                          <ClipboardList className="h-5 w-5 shrink-0" />
                          My Requests
                        </Link>
                        <Link
                          href="/app/submissions"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            pathname === "/app/submissions"
                              ? "bg-gray-100 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          )}
                        >
                          <Send className="h-5 w-5 shrink-0" />
                          Proposals
                        </Link>
                        <Link
                          href="/app/personal-items"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            pathname === "/app/personal-items"
                              ? "bg-gray-100 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          )}
                        >
                          <Package className="h-5 w-5 shrink-0" />
                          Inventory
                        </Link>
                        <Link
                          href="/app/saved"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            pathname === "/app/saved"
                              ? "bg-gray-100 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          )}
                        >
                          <Bookmark className={cn(
                            "h-5 w-5 shrink-0",
                            pathname === "/app/saved" && "fill-current"
                          )} />
                          Saved
                        </Link>
                        <Link
                          href="/app/notifications"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative",
                            pathname === "/app/notifications"
                              ? "bg-gray-100 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          )}
                        >
                          <Bell className="h-5 w-5 shrink-0" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-auto h-5 w-5 rounded-full bg-[#7755FF] text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          href="/app/leaderboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            pathname === "/app/leaderboard"
                              ? "bg-gray-100 text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                          )}
                        >
                          <Trophy className="h-5 w-5 shrink-0" />
                          Leaderboard
                        </Link>
                      </>
                    )}
                  </nav>

                  {/* Account Section */}
                  {user && (
                    <div className="border-t border-[#e5e7eb] p-4 space-y-1">
                      <Link
                        href={profile?.username ? `/app/profile/${profile.username}` : "/app/settings"}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          pathname.startsWith("/app/profile/")
                            ? "bg-gray-100 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                        )}
                      >
                        <User className="h-5 w-5 shrink-0" />
                        Profile
                      </Link>
                      <Link
                        href="/app/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          pathname === "/app/settings"
                            ? "bg-gray-100 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                        )}
                      >
                        <Settings className="h-5 w-5 shrink-0" />
                        Settings
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        disabled={isPending}
                        className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-gray-50"
                      >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Sign out
                      </Button>
                    </div>
                  )}

                  {/* Guest Actions */}
                  {!user && (
                    <div className="border-t border-[#e5e7eb] p-4 space-y-2">
                      <Button asChild className="w-full bg-[#7755FF] hover:bg-[#6644EE]">
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                      <LoginDropdown />
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navbar */}
      <div className="hidden md:flex w-full items-center gap-4 py-3 px-6">
        {/* Brand */}
        <Link href="/app" prefetch={true} className="shrink-0 flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="onseek"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span className="text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
            onseek
          </span>
        </Link>
        
        {/* Navigation Links */}
        <nav className="flex items-center gap-1 overflow-x-auto">
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

        {/* Explore Dropdown - Desktop */}
        <DropdownMenu open={exploreOpen} onOpenChange={setExploreOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1",
                pathname === "/" || pathname.startsWith("/app/category") || pathname.startsWith("/app/requests")
                  ? "text-foreground"
                  : "text-gray-600"
              )}
            >
              Explore
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-56 bg-white shadow-lg shadow-gray-200/50"
          >
            <DropdownMenuItem onClick={() => router.push("/")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Popular
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/?sort=newest")}>
              <Sparkles className="h-4 w-4 mr-2" />
              New and Noteworthy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map((category) => {
              const categoryPath = `/app/category/${category.toLowerCase()}`;
              const isActive = pathname === categoryPath;
              return (
                <DropdownMenuItem
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={isActive ? "bg-muted/30" : ""}
                >
                  {category}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Search Bar - Medium Width (hidden on home page when hero is visible) */}
          {showSearch && (
            <div className="flex mr-2">
              <form action="/search" method="get" className="relative flex items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Search..."
                    className="pl-9 pr-32  border w-full rounded-l-full rounded-r-none"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="h-11 flex items-center gap-1.5 px-3 text-sm font-medium text-foreground hover:bg-gray-50 rounded-r-full  border border-l-0 shrink-0"
                    >
                      {searchType === "requests" ? "Requests" : "Items"}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setSearchType("requests")}>
                      <div className="flex flex-col">
                        <span className="font-medium">Requests</span>
                        <span className="text-xs text-muted-foreground">Search community requests</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSearchType("items")}>
                      <div className="flex flex-col">
                        <span className="font-medium">Items</span>
                        <span className="text-xs text-muted-foreground">Search products and items</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </form>
            </div>
          )}
          {user ? (
            <>
              <Button asChild className="hidden sm:flex h-11 rounded-full bg-[#212733] text-white hover:bg-[#212733]/90 border border-[#222234]">
                <Link href="/app/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Create a request
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/app/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#7755FF] text-white text-[10px] font-semibold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-foreground font-medium text-sm">
                      {profile?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <div className="px-2 py-2 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-foreground font-medium text-sm">
                        {profile?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium">
                        {profile?.username || "User"}
                      </span>
                    </div>
                  </div>
                  
                  {/* My Content */}
                  <DropdownMenuItem asChild>
                    <Link href="/app/requests" className="flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Requests
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/submissions" className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Proposals
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/inventory" className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Inventory
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/saved" className="flex items-center">
                      <Bookmark className={cn(
                        "h-4 w-4 mr-2",
                        pathname === "/app/saved" && "fill-current"
                      )} />
                      Saved
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/app/leaderboard" className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      Leaderboard
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Account */}
                  <DropdownMenuItem asChild>
                    <Link href={profile?.username ? `/app/profile/${profile.username}` : "/app/settings"} className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Actions */}
                  <DropdownMenuItem onClick={handleSignOut} disabled={isPending} className="flex items-center">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/signup">
                <Button variant="outline" size="sm" className="border-0  text-[#212733] hover:bg-gray-50">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create a request
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="bg-[#222234] text-white hover:bg-[#222234]/90">
                  Sign Up
                </Button>
              </Link>
              <div className="ml-3">
                <LoginDropdown />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


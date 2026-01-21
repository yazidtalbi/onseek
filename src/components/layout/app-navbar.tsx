"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, Plus, ChevronDown, TrendingUp, Sparkles, Moon, Sun, LogOut, Heart } from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";
import { useTheme } from "@/components/layout/theme-provider";
import { signOutAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MAIN_CATEGORIES } from "@/lib/categories";

const categories = MAIN_CATEGORIES;

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [isPending, startTransition] = useTransition();
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
    <header className="sticky top-0 z-20 bg-[#fbfcfd] backdrop-blur-sm w-full">
      <div className="flex w-full items-center gap-4 py-3 px-6">
        {/* Brand */}
        <Link href="/" className="text-xl font-bold text-foreground shrink-0" style={{ fontFamily: 'var(--font-expanded)' }}>
          Onseek
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
          
          {/* Explore Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1",
                       pathname === "/" || pathname.startsWith("/app/category") || pathname.startsWith("/app/requests")
                           ? "text-[#7755FF]"
                           : "text-gray-600 hover:text-[#7755FF]"
                       )}
                     >
                       Explore
                       <ChevronDown className="h-4 w-4" />
                     </button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="start" className="w-56">
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
        </nav>

        {/* Search Bar - Centered (hidden on home page when hero is visible) */}
        {showSearch && (
          <div className="flex-1 flex justify-center max-w-md mx-4">
            <form action="/search" method="get" className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search requests..."
                className="pl-9 bg-card/70 border-border w-full rounded-full"
              />
            </form>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {user ? (
            <>
              <Button asChild size="sm" className="hidden sm:flex rounded-full bg-[#212733] text-white hover:bg-[#212733]/90">
                <Link href="/app/new">
                  <Plus className="h-4 w-4 mr-1" />
                  Create a request
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" asChild className={cn(
                "relative",
                pathname === "/app/saved" && "text-[#7755FF]"
              )}>
                <Link href="/app/saved">
                  <Heart className={cn(
                    "h-5 w-5",
                    pathname === "/app/saved" && "fill-current"
                  )} />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-foreground font-medium text-sm">
                      {profile?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden lg:inline text-sm font-medium">
                      {profile?.username || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={profile?.username ? `/app/profile/${profile.username}` : "/app/settings"}>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/submissions">Submissions</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="accent" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


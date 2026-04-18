"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();
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

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      !isVisible ? "-translate-y-full" : "translate-y-0",
      isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100" : "bg-white"
    )}>
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-8 py-4">
        <Link href="/" className="text-lg font-bold text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
          Onseek
        </Link>
        <div className="flex items-center gap-3">
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
          <Link href="/login" className="text-sm font-semibold text-foreground">
            Log in
          </Link>
          <div className="ml-3">
            <Button asChild variant="accent" size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}


"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";

export function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-50 bg-white">
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


"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/components/layout/theme-provider";
import { cn } from "@/lib/utils";
import { getRequestsCountAction } from "@/actions/request.actions";

interface PublicNavbarProps {
  disableHide?: boolean;
}

const LiveStats = React.memo(function LiveStats() {
  const [stats, setStats] = useState({ usersActive: 122, seekersToday: 842 });
  const jitterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const calculateStats = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const decimalHour = h + m / 60;
      
      const intensity = (Math.cos((decimalHour - 18) * Math.PI / 12) + 1) / 2;
      // Range: 12 to 28
      const baseUsers = 12 + Math.floor(intensity * 16);
      
      const today = now.toISOString().split('T')[0];
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Range: 210 to 270
      const dailySeekers = 210 + (seed % 60);

      return {
        usersActive: baseUsers,
        seekersToday: dailySeekers
      };
    };

    setStats(calculateStats());

    const scheduleJitter = () => {
      const delay = Math.floor(Math.random() * (20000 - 2000 + 1)) + 2000; // 2s to 20s
      jitterTimeoutRef.current = setTimeout(() => {
        setStats(prev => ({
          ...prev,
          usersActive: Math.max(40, prev.usersActive + (Math.random() > 0.5 ? 1 : -1))
        }));
        jitterTimeoutRef.current = scheduleJitter();
      }, delay);
      return jitterTimeoutRef.current;
    };

    jitterTimeoutRef.current = scheduleJitter();

    const baseInterval = setInterval(() => {
      const newStats = calculateStats();
      setStats(prev => ({
        ...newStats,
        usersActive: newStats.usersActive
      }));
    }, 60000);

    return () => {
      if (jitterTimeoutRef.current) clearTimeout(jitterTimeoutRef.current);
      clearInterval(baseInterval);
    };
  }, []);

  return (
    <div className="hidden lg:flex items-center ml-4 mr-auto">
      <div className="w-px h-3.5 bg-[#E5E7EB]" />
      <div className="flex items-baseline gap-1.5 ml-4 text-[13px] font-medium tracking-tight">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] shadow-[0_0_8px_rgba(0,255,156,0.4)] animate-pulse mb-[-1px]" />
        <div className="flex items-center gap-1.5 text-neutral-500">
          <span className="font-mono text-neutral-900 font-bold">{stats.usersActive.toLocaleString()}</span>
          <span>online</span>
          <span className="text-neutral-300 mx-0.5">•</span>
          <span className="font-mono text-neutral-900 font-bold">{stats.seekersToday.toLocaleString()}</span>
          <span>seekers today</span>
        </div>
      </div>
    </div>
  );
});

export function PublicNavbar({ disableHide = false }: PublicNavbarProps) {
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

        if (currentScrollY > lastScrollY && currentScrollY > 100 && !disableHide) {
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
      isScrolled ? "bg-white border-b border-gray-100" : "bg-white"
    )}>
      <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <Image src="/logonseek.svg" alt="onseek" width={28} height={28} className="h-7 w-auto" priority />
          <span className="text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>Onseek</span>
        </Link>

        <LiveStats />
        <div className="flex items-center gap-3">
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

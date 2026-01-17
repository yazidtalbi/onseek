"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bell, Plus, Grid3x3 } from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/layout/app-sidebar";

export function AppNavbar() {
  const { setOpen } = useSidebar();
  const pathname = usePathname();
  const { profile } = useAuth();
  
  const navItems = [
    { href: "/app", label: "Home" },
    { href: "/app/requests", label: "Requests" },
    { href: "/app/submissions", label: "Submissions" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden shrink-0" 
          onClick={() => setOpen(true)}
        >
          <Grid3x3 className="h-5 w-5" />
        </Button>
        
        <Link href="/app" className="text-lg font-bold text-primary shrink-0">
          Onseek
        </Link>
        
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  "px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 max-w-md">
          <form action="/app" method="get" className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search requests..."
              className="pl-9 bg-muted/50 border-border"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="accent" size="sm" className="hidden sm:flex">
            <Link href="/app/new">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
          <Link 
            href={profile?.username ? `/app/profile/${profile.username}` : "/app/settings"}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {profile?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden md:inline text-sm font-medium">
              {profile?.username || "User"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}


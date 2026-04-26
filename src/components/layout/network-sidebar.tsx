"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Send, 
  Package, 
  Bookmark, 
  Trophy, 
  User, 
  Settings, 
  LogOut, 
  Plus,
  ChevronDown,
  Home,
  Bell
} from "lucide-react";
import { useAuth } from "@/components/layout/auth-provider";
import { signOutAction } from "@/actions/auth.actions";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Image from "next/image";

export function NetworkSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
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

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/requests", label: "Requests", icon: ClipboardList },
    { href: "/submissions", label: "Proposals", icon: Send },
    { href: "/personal-items", label: "Inventory", icon: Package },
    { href: "/saved", label: "Saved", icon: Bookmark },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };

  const handleGuestClick = (href?: string) => {
    // For visitors, always send them to login regardless of the target
    router.push("/login");
  };

  return (
    <section className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Logo */}
      <Link
        href={user ? "/" : "/login"}
        prefetch={true}
        onClick={(e) => {
          if (!user) {
            e.preventDefault();
            handleGuestClick();
          }
        }}
        className="flex items-center gap-2 mb-6"
      >
        <Image
          src="/logo-final.svg"
          alt="onseek"
          width={28}
          height={28}
          className="h-7 w-auto"
          priority
        />
        <span className="text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>
          onseek
        </span>
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Navigation Links */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;

            const commonClasses = cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-base relative w-full text-left",
              active
                ? "bg-gray-100 text-foreground font-medium"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            );

            if (!user) {
              return (
                <button
                  key={link.href}
                  type="button"
                  className={commonClasses}
                  onClick={() => handleGuestClick(link.href)}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      "text-gray-400"
                    )}
                  />
                  <span>{link.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-base relative",
                  active
                    ? "bg-gray-100 text-foreground font-medium"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    link.href === "/saved" && active && "fill-current",
                    !active && "text-gray-400"
                  )}
                />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-auto h-5 w-5 rounded-full bg-[#7755FF] text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom area - Post request / auth */}
      <div className="pt-4 space-y-4 flex-shrink-0">
        {/* Primary CTA */}
        {user ? (
          <Button 
            asChild 
            className="w-full h-14 rounded-full bg-[#212733] text-white hover:bg-[#212733]/90 border border-[#222234] text-base font-medium"
          >
            <Link href="/new">
              Post request
            </Link>
          </Button>
        ) : (
          <Button
            className="w-full h-14 rounded-full bg-[#212733] text-white hover:bg-[#212733]/90 border border-[#222234] text-base font-medium"
            onClick={() => handleGuestClick("/new")}
          >
            Log in to post
          </Button>
        )}

        {/* User / Login area */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-foreground font-medium text-base flex-shrink-0">
                  {profile?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="flex-1 text-left text-base font-medium">
                  {profile?.username || "User"}
                </span>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={profile?.username ? `/profile/${profile.username}` : "/settings"} className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={isPending} className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="w-full h-11 rounded-full text-base font-medium"
            onClick={() => handleGuestClick()}
          >
            Log in
          </Button>
        )}
      </div>
    </section>
  );
}

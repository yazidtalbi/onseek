"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ClipboardList, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/layout/auth-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/requests", label: "My Requests", icon: ClipboardList },
    { href: "/app/new", label: "New", icon: PlusCircle, cta: true },
    { href: "/app/submissions", label: "My Submissions", icon: Send },
    {
      href: profile?.username ? `/app/profile/${profile.username}` : "/app/settings",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 px-6 py-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center gap-1 text-[10px] font-semibold",
                item.cta
                  ? "rounded-2xl bg-accent px-3 py-2 text-foreground"
                  : "text-muted-foreground",
                isActive && !item.cta && "text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ClipboardList, Send, User, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/layout/auth-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/requests", label: "My Requests", icon: ClipboardList },
    { href: "/app/new", label: "New", icon: PlusCircle, cta: true },
    { href: "/app/personal-items", label: "Items", icon: Package },
    {
      href: profile?.username ? `/app/profile/${profile.username}` : "/app/settings",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e5e7eb]  px-6 py-3 md:hidden">
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
                "flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors",
                item.cta
                  ? "rounded-2xl bg-[#7755FF] px-3 py-2 text-white hover:bg-[#6644EE]"
                  : isActive
                  ? "text-[#7755FF]"
                  : "text-gray-600 hover:text-[#7755FF]"
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


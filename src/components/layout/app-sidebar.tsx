"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  X,
  Settings,
  User,
  Send,
  Package,
  MessageCircle,
  ClipboardList,
  Bookmark,
  Trophy,
  LogOut,
  Bell,
  Library,
  Hand,
  Handshake,
  MessageCircleMore,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/layout/auth-provider";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createContext, useContext, useState, ReactNode, useTransition } from "react";
import Image from "next/image";
import { signOutAction } from "@/actions/auth.actions";
import { NotificationsDrawer } from "@/components/notifications/notifications-drawer";

const SidebarContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Compact icon button with tooltip ───────────────────────────────────────
function NavIcon({
  label,
  icon: Icon,
  active,
  children,
}: {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  children?: ReactNode; // allow wrapping with <Link> or <button>
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-md transition-colors cursor-pointer",
            active
              ? "bg-gray-100 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Mobile sidebar content (full labels) ────────────────────────────────────
function MobileSidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { setOpen } = useSidebar();
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
      handleClose();
    });
  };

  const mainNavItems = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/requests", label: "Requests", icon: Hand },
    { href: "/app/submissions", label: "Proposals", icon: FileText },
    { href: "/app/inventory", label: "Inventory", icon: Library },
    { href: "/messages", label: "Messages", icon: MessageCircleMore },
    { href: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const NavLink = ({ item, active }: { item: (typeof mainNavItems)[0]; active: boolean }) => (
    <Link
      href={item.href}
      onClick={handleClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active
          ? "bg-transparent text-[#7a61ff]"
          : "text-gray-400 hover:text-foreground hover:bg-gray-50"
      )}
    >
      <item.icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 mb-6">
        <Link href="/app" onClick={handleClose} className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="onseek" width={100} height={24} className="h-6 w-auto" priority />
          <span className="text-xl text-black" style={{ fontFamily: "var(--font-expanded)", fontWeight: 600 }}>
            onseek
          </span>
        </Link>
      </div>

      <nav className="space-y-1 px-4 flex-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          return <NavLink key={item.href} item={item} active={isActive} />;
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-1">
        {user ? (
          <>
            <Link
              href="/app/settings"
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === "/app/settings"
                  ? "bg-transparent text-[#7a61ff]"
                  : "text-gray-400 hover:text-foreground hover:bg-gray-50"
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </>
        ) : (
          <div className="space-y-2">
            <Button asChild className="w-full bg-[#7755FF] hover:bg-[#6644EE]">
              <Link href="/signup" onClick={handleClose}>Sign Up</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login" onClick={handleClose}>Log In</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Desktop compact sidebar (icons + tooltips) ───────────────────────────────
function DesktopSidebarContent() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  const mainNavItems = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/requests", label: "Requests", icon: Hand },
    { href: "/app/submissions", label: "Proposals", icon: FileText },
    { href: "/app/inventory", label: "Inventory", icon: Library },
    { href: "/messages", label: "Messages", icon: MessageCircleMore },
    { href: "/app/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full items-center py-4 gap-1">

        {/* Main nav */}
        <nav className="flex flex-col items-center gap-6 flex-1 w-full px-2">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-md transition-colors",
                      isActive
                        ? "bg-transparent text-[#7a61ff]"
                        : "text-gray-400 hover:text-foreground hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-6 w-full px-2">
          {user ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/app/settings"
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-md transition-colors",
                      pathname === "/app/settings"
                        ? "bg-transparent text-[#7a61ff]"
                        : "text-gray-400 hover:text-foreground hover:bg-gray-50"
                    )}
                  >
                    <Settings className="h-6 w-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
                  Settings
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center w-12 h-12 rounded-md bg-[#7755FF] text-white hover:bg-[#6644EE] transition-colors"
                  >
                    <User className="h-[22px] w-[22px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
                  Sign Up
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────
export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile: Sheet Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col space-y-6 py-4">
            <div className="px-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
            <MobileSidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Compact icon-only sidebar (72px wide) */}
      {user && (
        <aside className="hidden md:flex md:fixed md:top-16 md:bottom-0 md:left-0 md:z-30 md:w-[72px] md:border-r md:border-border md:bg-card flex-col">
          <DesktopSidebarContent />
        </aside>
      )}

      {/* Main Content offset by compact sidebar */}
      <div className={cn("flex-1 w-full min-w-0 transition-all duration-300", user && "md:ml-[72px]")}>
        {children}
      </div>
    </>
  );
}

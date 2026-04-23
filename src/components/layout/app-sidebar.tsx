"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome2,
  IconHome2Filled,
  IconX,
  IconSettings,
  IconSettingsFilled,
  IconUser,
  IconSend,
  IconStack2,
  IconStackFront,
  IconMessageCircle,
  IconMessageCircleFilled,
  IconClipboardList,
  IconBookmark,
  IconTrophy,
  IconTrophyFilled,
  IconLogout,
  IconBell,
  IconBinoculars,
  IconFileText,
  IconLifebuoy,
  IconMenu2
} from "@tabler/icons-react";
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
import { createContext, useContext, useState, ReactNode, useTransition, useEffect } from "react";
import Image from "next/image";
import { signOutAction } from "@/actions/auth.actions";
import { NotificationsDrawer } from "@/components/notifications/notifications-drawer";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { FeedbackModal } from "@/components/reports/feedback-modal";

function useUnreadMessages() {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);
  useEffect(() => {
    if (!user) { setHasUnread(false); return; }
    const supabase = createBrowserSupabaseClient();
    const fetchUnread = async () => {
      const { count } = await supabase.from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id).eq("read", false).eq("type", "new_message");
      setHasUnread((count || 0) > 0);
    };
    fetchUnread();
    const channel = supabase.channel("sidebar_messages_notif")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
        fetchUnread();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);
  return hasUnread;
}

const SidebarContext = createContext<{
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  expanded: boolean;
  setExpanded: (open: boolean) => void;
}>({
  mobileOpen: false,
  setMobileOpen: () => { },
  expanded: false,
  setExpanded: () => { },
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ 
      mobileOpen, 
      setMobileOpen, 
      expanded, 
      setExpanded 
    }}>
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
  const { setMobileOpen } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleClose = () => {
    setMobileOpen(false);
    onClose?.();
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
      handleClose();
    });
  };

  const mainNavItems = [
    { href: "/", label: "Home", icon: IconHome2, activeIcon: IconHome2Filled },
    { href: "/requests", label: "Requests", icon: IconBinoculars, activeIcon: IconBinoculars },
    { href: "/submissions", label: "Proposals", icon: IconFileText, activeIcon: IconFileText },
    { href: "/inventory", label: "Inventory", icon: IconStack2, activeIcon: IconStackFront },
    { href: "/messages", label: "Messages", icon: IconMessageCircle, activeIcon: IconMessageCircleFilled },];

  const hasUnreadMessages = useUnreadMessages();

  const NavLink = ({ item, active }: { item: (typeof mainNavItems)[0]; active: boolean }) => (
    <Link
      href={item.href}
      onClick={handleClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative",
        active
          ? "bg-transparent text-[#1e2330]"
          : "text-black hover:text-foreground hover:bg-gray-50"
      )}
    >
      <div className="relative">
        {active ? <item.activeIcon className="h-6 w-6" stroke={1.5} /> : <item.icon className="h-6 w-6" stroke={1.5} />}
        {item.href === "/messages" && hasUnreadMessages && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border border-white" />
        )}
      </div>
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 mb-6">
        <Link href="/" onClick={handleClose} className="flex items-center gap-2 group">
          <Image src="/logonseek.svg" alt="onseek" width={28} height={28} className="h-7 w-auto" priority />
          <span className="text-xl text-[#000000]" style={{ fontFamily: "var(--font-expanded)", fontWeight: 600 }}>
            onseek
          </span>
        </Link>
      </div>

      <nav className="space-y-3 px-4 flex-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return <NavLink key={item.href} item={item} active={isActive} />;
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        {user ? (
          <>
            <Link
              href="/settings"
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative",
                pathname === "/settings"
                  ? "bg-transparent text-[#1e2330]"
                  : "text-black hover:text-foreground hover:bg-gray-50"
              )}
            >
              {pathname === "/settings" ? <IconSettingsFilled className="h-6 w-6" stroke={1.5} /> : <IconSettings className="h-6 w-6" stroke={1.5} />}
              <span>Settings</span>
            </Link>
            <Link
              href="/leaderboard"
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative",
                pathname === "/leaderboard"
                  ? "bg-transparent text-[#1e2330]"
                  : "text-black hover:text-foreground hover:bg-gray-50"
              )}
            >
              {pathname === "/leaderboard" ? <IconTrophyFilled className="h-6 w-6" stroke={1.5} /> : <IconTrophy className="h-6 w-6" stroke={1.5} />}
              <span>Leaderboard</span>
            </Link>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative w-full text-left",
                "text-black hover:text-foreground hover:bg-gray-50"
              )}
            >
              <IconLifebuoy className="h-6 w-6" stroke={1.5} />
              <span>Feedback</span>
            </button>
            <button
              onClick={handleSignOut}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative w-full text-left text-rose-600 hover:bg-rose-50"
              )}
            >
              <IconLogout className="h-6 w-6" stroke={1.5} />
              <span>Log Out</span>
            </button>
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
      <FeedbackModal open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </div>
  );
}

// ─── Desktop compact sidebar (icons + tooltips) ───────────────────────────────
function DesktopSidebarContent() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { expanded: isExpanded } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const hasUnreadMessages = useUnreadMessages();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  const mainNavItems = [
    { href: "/", label: "Home", icon: IconHome2, activeIcon: IconHome2Filled },
    { href: "/requests", label: "Requests", icon: IconBinoculars, activeIcon: IconBinoculars },
    { href: "/submissions", label: "Proposals", icon: IconFileText, activeIcon: IconFileText },
    { href: "/inventory", label: "Inventory", icon: IconStack2, activeIcon: IconStackFront },
    { href: "/messages", label: "Messages", icon: IconMessageCircle, activeIcon: IconMessageCircleFilled },];

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn(
        "flex flex-col h-full pt-3 pb-4 transition-all duration-300 overflow-hidden",
        isExpanded ? "px-4 items-stretch" : "items-center"
      )}>

        {/* Main nav */}
        <nav className="flex flex-col gap-6 flex-1 w-full">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center transition-all relative group/item rounded-2xl h-12 w-12",
                      isExpanded ? "w-full pl-6 pr-4 gap-4 h-12" : "justify-center mx-auto",
                      isActive
                        ? "bg-gray-100 text-[#1e2330]"
                        : "text-black hover:text-foreground hover:bg-gray-50"
                    )}
                  >
                    <div className="relative shrink-0">
                      {isActive ? <item.activeIcon className="h-7 w-7" stroke={1.5} /> : <item.icon className="h-7 w-7" stroke={1.5} />}
                      {item.href === "/messages" && hasUnreadMessages && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    {isExpanded && (
                      <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col gap-6 w-full mt-auto">
          {user && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/settings"
                    className={cn(
                      "flex items-center transition-all relative group/item rounded-2xl h-12 w-12",
                      isExpanded ? "w-full pl-6 pr-4 gap-4 h-12" : "justify-center mx-auto",
                      pathname === "/settings"
                        ? "bg-gray-100 text-[#1e2330]"
                        : "text-black hover:text-foreground hover:bg-gray-50"
                    )}
                  >
                    {pathname === "/settings" ? <IconSettingsFilled className="h-7 w-7 shrink-0" stroke={1.5} /> : <IconSettings className="h-7 w-7 shrink-0" stroke={1.5} />}
                    {isExpanded && (
                      <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        Settings
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
                    Settings
                  </TooltipContent>
                )}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/leaderboard"
                    className={cn(
                      "flex items-center transition-all relative group/item rounded-2xl h-12 w-12",
                      isExpanded ? "w-full pl-6 pr-4 gap-4 h-12" : "justify-center mx-auto",
                      pathname === "/leaderboard"
                        ? "bg-gray-100 text-[#1e2330]"
                        : "text-black hover:text-foreground hover:bg-gray-50"
                    )}
                  >
                    {pathname === "/leaderboard" ? <IconTrophyFilled className="h-7 w-7 shrink-0" stroke={1.5} /> : <IconTrophy className="h-7 w-7 shrink-0" stroke={1.5} />}
                    {isExpanded && (
                      <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        Leaderboard
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
                    Leaderboard
                   </TooltipContent>
                )}
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsFeedbackOpen(true)}
                    className={cn(
                      "flex items-center transition-all relative group/item rounded-2xl h-12 w-12",
                      isExpanded ? "w-full pl-6 pr-4 gap-4 h-12" : "justify-center mx-auto",
                      "text-black hover:text-foreground hover:bg-gray-50"
                    )}
                  >
                    <IconLifebuoy className="h-7 w-7 shrink-0" stroke={1.5} />
                    {isExpanded && (
                      <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        Feedback
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right" sideOffset={8} className="bg-[#212733] text-white border-[#212733]">
                    Feedback
                  </TooltipContent>
                )}
              </Tooltip>
            </>
          )}
        </div>
        <FeedbackModal open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
      </div>
    </TooltipProvider>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────
export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { mobileOpen, setMobileOpen, expanded } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: Sheet Menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col space-y-6 py-4">
            <MobileSidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Compact icon-only sidebar */}
      {user && (
        <aside 
          className={cn(
            "hidden md:flex md:fixed md:top-20 md:bottom-0 md:left-0 md:z-30 md:bg-white flex-col transition-all duration-300 ease-in-out border-none outline-none",
            expanded ? "md:w-[240px]" : "md:w-[72px]"
          )}
        >
          <DesktopSidebarContent />
        </aside>
      )}

      {/* Main Content offset */}
      <div 
        className={cn(
          "flex-1 w-full min-w-0 transition-all duration-300 ease-in-out", 
          (!user && pathname === "/") ? "pt-0" : "pt-20",
          user && (expanded ? "md:ml-[240px]" : "md:ml-[72px]")
        )}
      >
        {children}
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Lightbulb, 
  Grid3x3, 
  X,
  Settings,
  User,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/layout/auth-provider";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createContext, useContext, useState, ReactNode } from "react";

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

function SidebarContent({ 
  onClose 
}: { 
  onClose?: () => void 
}) {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { setOpen } = useSidebar();

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const mainNavItems = [
    { href: "/app", label: "Home", icon: Home },
    { href: "/app/requests", label: "Requests", icon: Lightbulb },
    { href: "/app/submissions", label: "Submissions", icon: Send },
  ];

  const categoryNavItems = [
    { href: "/app/requests?category=All", label: "All Categories", icon: Grid3x3 },
  ];

  const accountNavItems = [
    { href: profile?.username ? `/app/profile/${profile.username}` : "/app/settings", label: "Profile", icon: User },
    { href: "/app/settings", label: "Settings", icon: Settings },
  ];

  const NavLink = ({ item, active }: { item: typeof mainNavItems[0]; active: boolean }) => (
    <Link
      href={item.href}
      onClick={handleClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active
          ? "bg-muted text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <item.icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <>
      <nav className="space-y-1 px-4">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          return <NavLink key={item.href} item={item} active={isActive} />;
        })}
      </nav>

      <div className="border-t border-border px-4 pt-4">
        <nav className="space-y-1">
          {categoryNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return <NavLink key={item.href} item={item} active={isActive} />;
          })}
        </nav>
      </div>

      <div className="border-t border-border px-4 pt-4">
        <nav className="space-y-1">
          {accountNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/app/settings" && pathname.startsWith(item.href));
            return <NavLink key={item.href} item={item} active={isActive} />;
          })}
        </nav>
      </div>
    </>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();

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
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Static Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-10 md:w-64 md:border-r md:border-border md:bg-card md:pt-16">
        <div className="flex h-full flex-col space-y-6 py-4">
          <div className="px-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          <SidebarContent />
        </div>
      </aside>

      {/* Main Content with sidebar offset */}
      <div className={cn(
        "flex-1",
        "md:ml-64" // Offset for desktop sidebar
      )}>
        {children}
      </div>
    </>
  );
}



"use client";

import { usePathname } from "next/navigation";
import { PromotionalSidebar } from "@/components/requests/promotional-sidebar";
import { cn } from "@/lib/utils";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showPromotional = false; // pathname === "/";

  if (!showPromotional) {
    return (
      <div className={cn(
        "flex-1 w-full mx-auto",
        pathname === "/" || pathname === "/landing" || pathname.includes("/latest") || pathname.includes("/popular") || pathname.includes("/for-you")
          ? "px-0 pt-0 pb-0" 
          : pathname.startsWith("/requests/") 
            ? "px-3 md:px-6 pt-2 md:pt-6 pb-8"
            : "px-3 md:px-6 pt-4 md:pt-6 pb-8"
      )}>
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">{children}</div>
      <div className="hidden lg:block w-[320px] flex-shrink-0">
        <PromotionalSidebar />
      </div>
    </div>
  );
}


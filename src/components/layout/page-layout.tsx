"use client";

import { usePathname } from "next/navigation";
import { PromotionalSidebar } from "@/components/requests/promotional-sidebar";
import { cn } from "@/lib/utils";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showPromotional = false; // pathname === "/app";

  if (!showPromotional) {
    return (
      <div className={cn(
        "flex-1 w-full mx-auto max-w-[1360px] px-4 md:px-6",
        pathname === "/app" ? "pt-2 md:pt-2 pb-0" : "pt-8 md:pt-8 pb-8"
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


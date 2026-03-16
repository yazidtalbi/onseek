"use client";

import { usePathname } from "next/navigation";
import { PromotionalSidebar } from "@/components/requests/promotional-sidebar";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showPromotional = pathname === "/app";

  if (!showPromotional) {
    return <>{children}</>;
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


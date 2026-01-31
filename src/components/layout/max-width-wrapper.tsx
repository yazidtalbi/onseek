"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MaxWidthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRequestPage = pathname.startsWith("/app/requests/") && pathname !== "/app/requests";

  return (
    <div className={cn("mx-auto w-full", isRequestPage ? "max-w-[1280px]" : "max-w-[1280px]")}>
      {children}
    </div>
  );
}


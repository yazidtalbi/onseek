"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MaxWidthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppHome = pathname === "/app";
  const isRequestPage = pathname.startsWith("/app/requests/") && pathname !== "/app/requests";

  return (
    <div
      className={cn(
        "w-full",
        !isAppHome && "mx-auto max-w-[1280px]"
      )}
    >
      {children}
    </div>
  );
}


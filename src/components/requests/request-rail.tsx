"use client";

import { useMemo } from "react";
import Link from "next/link";
import { RequestCardGrid } from "@/components/requests/request-card-grid";
import { ChevronRight } from "lucide-react";
import type { RequestItem } from "@/lib/types";

export function RequestRail({
  title,
  requests,
  viewAllHref,
}: {
  title: string;
  requests: (RequestItem & { images?: string[] })[];
  viewAllHref?: string;
}) {
  // Filter out hidden requests
  const visibleRequests = useMemo(() => {
    if (typeof window === "undefined" || !requests) return requests || [];
    
    try {
      const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
      return requests.filter((req) => !hidden.includes(req.id));
    } catch (error) {
      console.error("Error reading hidden requests:", error);
      return requests;
    }
  }, [requests]);

  if (!visibleRequests || visibleRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleRequests.map((request) => (
          <RequestCardGrid
            key={request.id}
            request={request}
            images={request.images || []}
          />
        ))}
      </div>
    </div>
  );
}


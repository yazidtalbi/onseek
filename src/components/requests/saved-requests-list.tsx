"use client";

import type { RequestItem } from "@/lib/types";
import { RequestCard } from "@/components/requests/request-card";

export function SavedRequestsList({
  initialRequests,
}: {
  initialRequests: RequestItem[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {initialRequests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          variant="feed"
          isFavorite={true}
          isFirst={true}
          isLast={true}
        />
      ))}
    </div>
  );
}


"use client";

import Link from "next/link";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatSubmissionCount } from "@/lib/utils/submissions";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import type { RequestItem } from "@/lib/types";
import Image from "next/image";

function cleanDescription(description: string) {
  return description.replace(/<!--REQUEST_PREFS:.*?-->/, "").trim();
}

function parseRequestPreferences(description: string) {
  const match = description.match(/<!--REQUEST_PREFS:({.*?})-->/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

function RequestCardGridComponent({ request, isFavorite, images = [] }: { request: RequestItem; isFavorite?: boolean; images?: string[] }) {
  const timeAgo = formatTimeAgo(request.created_at);
  const cleanDesc = cleanDescription(request.description);
  const preferences = parseRequestPreferences(request.description) || {
    priceLock: "open",
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
  };
  const hasOptions = preferences.priceLock === "locked" || preferences.exactItem || preferences.exactSpecification || preferences.exactPrice;
  
  return (
    <div className="relative h-full">
      <Link href={`/app/requests/${request.id}`} prefetch={true} className="block h-full">
        <Card className="border-[#e5e7eb] bg-white h-full flex flex-col hover:border-foreground/30 hover:bg-[#fbfcfd] transition-colors cursor-pointer min-h-[320px]">
          <CardContent className="p-6 flex flex-col flex-1 space-y-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Posted {timeAgo}</span>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
                <RequestMenu
                  requestId={request.id}
                  requestUserId={request.user_id}
                  status={request.status}
                />
              </div>
            </div>
          
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-2">
                {request.title}
              </h3>
              {(request.budget_min || request.budget_max) && (
                <p className="text-2xl font-bold text-foreground">
                  {request.budget_min && request.budget_max ? (
                    <>${request.budget_min} - ${request.budget_max}</>
                  ) : request.budget_min ? (
                    <>From ${request.budget_min}</>
                  ) : (
                    <>Up to ${request.budget_max}</>
                  )}
                </p>
              )}
              {request.submissionCount !== undefined && (
                <p className="text-sm text-gray-500">
                  {formatSubmissionCount(request.submissionCount)}
                </p>
              )}
            </div>
            <p className="text-base text-gray-600 line-clamp-4 leading-relaxed">
              {cleanDesc}
            </p>
          </div>
          
          {/* Images - Small thumbnails like detail page (max 3) */}
          {images && images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Images</p>
              <div className="flex flex-wrap gap-2">
                {images.slice(0, 3).map((imgUrl, index) => (
                  <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-100 hover:border-foreground/50 transition-colors">
                    <Image
                      src={imgUrl}
                      alt={`${request.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {request.country ? (
              <Badge variant="muted" className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {request.country}
              </Badge>
            ) : null}
            {request.condition ? <Badge variant="muted">{request.condition}</Badge> : null}
            {request.urgency ? <Badge variant="muted">{request.urgency}</Badge> : null}
            <Badge variant="muted">{request.category}</Badge>
          </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export const RequestCardGrid = memo(RequestCardGridComponent);


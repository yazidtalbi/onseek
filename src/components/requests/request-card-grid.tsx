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
    <div className="relative">
      <Link href={`/app/requests/${request.id}`} prefetch={true} className="block">
        <Card className="border-[#e5e7eb] bg-white flex flex-col hover:border-gray-300 hover:bg-[#fbfcfd] transition-colors cursor-pointer relative">
          <CardContent className="p-6 flex flex-col space-y-4">
            {/* Heart and Ellipsis - Top Right */}
            <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
              <RequestMenu
                requestId={request.id}
                requestUserId={request.user_id}
                status={request.status}
              />
            </div>
            
            <div className="space-y-2 pr-16">
              <p className="text-xs text-gray-600">Posted {timeAgo}</p>
              <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-2">
                {request.title}
              </h3>
              {/* Budget right under title */}
              {(request.budget_min || request.budget_max) && (
                <div className="flex flex-wrap gap-2 text-base text-[#7755FF] font-semibold" style={{ fontFamily: 'var(--font-expanded)' }}>
                  {request.budget_min && request.budget_max ? (
                    <span>${request.budget_min} - ${request.budget_max}</span>
                  ) : request.budget_min ? (
                    <span>From ${request.budget_min}</span>
                  ) : (
                    <span>Up to ${request.budget_max}</span>
                  )}
                </div>
              )}
            </div>
            <p className="text-base text-gray-600 line-clamp-4 leading-relaxed">
              {cleanDesc}
            </p>
            
            {/* Request Images - Small thumbnails */}
            {images && images.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {images.slice(0, 3).map((imgUrl, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-100 hover:border-gray-300 transition-colors">
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
            
            {/* Request Details */}
            <div className="space-y-3 pt-2">
              {/* Basic Info */}
              <div className="flex flex-wrap gap-2">
                {request.country ? (
                  <Badge variant="muted" className="flex items-center gap-1.5 bg-[#FFDECA]">
                    <MapPin className="h-4 w-4 text-[#FF5F00]" />
                    <span className="text-[#FF5F00]">{request.country}</span>
                  </Badge>
                ) : null}
                {request.condition ? <Badge variant="muted">{request.condition}</Badge> : null}
                {request.urgency ? <Badge variant="muted">{request.urgency}</Badge> : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

export const RequestCardGrid = memo(RequestCardGridComponent);


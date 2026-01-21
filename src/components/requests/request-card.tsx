"use client";

import Link from "next/link";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatSubmissionCount } from "@/lib/utils/submissions";
import { formatBudget } from "@/lib/utils/format";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import type { RequestItem } from "@/lib/types";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface RequestCardProps {
  request: RequestItem & { profiles?: { username?: string; display_name?: string | null } };
  variant?: "feed" | "detail";
  isFavorite?: boolean;
  images?: string[];
  links?: string[];
  attributes?: Array<{ label: string; value: boolean }>;
  currentUserId?: string | null;
  isFirst?: boolean;
  isLast?: boolean;
}

function RequestCardComponent({
  request,
  variant = "feed",
  isFavorite,
  images = [],
  links = [],
  attributes = [],
  currentUserId,
  isFirst = false,
  isLast = false,
}: RequestCardProps) {
  const timeAgo = formatTimeAgo(request.created_at);
  const cleanDesc = cleanDescription(request.description);
  const parsedPrefs = parseRequestPreferences(request.description) || {
    priceLock: "open",
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
    preferences: [],
    dealbreakers: [],
    notes: "",
  };

  const preferences = parsedPrefs.preferences || [];
  const dealbreakers = parsedPrefs.dealbreakers || [];

  const budgetText = formatBudget(request.budget_min, request.budget_max);
  const isFeed = variant === "feed";

  // Limit display for feed variant
  const maxImages = 3;
  const maxPreferences = isFeed ? 4 : preferences.length;
  const maxDealbreakers = isFeed ? 3 : dealbreakers.length;
  
  const visibleImages = images.slice(0, maxImages);
  const visiblePreferences = preferences.slice(0, maxPreferences);
  const visibleDealbreakers = dealbreakers.slice(0, maxDealbreakers);
  const remainingPreferences = preferences.length - maxPreferences;
  const remainingDealbreakers = dealbreakers.length - maxDealbreakers;
  
  const cardContent = (
    <CardContent className={cn("flex flex-col", isFeed ? "p-6" : "p-7")}>
        {/* Header: Posted time, Title, and Actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Requested {timeAgo}</p>
            {/* Title: Primary, outcome-oriented, max 2 lines */}
            <h3
          className={cn(
                "font-medium leading-snug line-clamp-2 text-[20px] text-foreground"
          )}
        >
              {request.title}
            </h3>
          </div>
          <div
            className="flex items-center gap-1.5 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <FavoriteButton
              requestId={request.id}
              isFavorite={isFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            />
            <RequestMenu
              requestId={request.id}
              requestUserId={request.user_id}
              status={request.status}
            />
          </div>
        </div>

        {/* Budget: Estimated budget and fixed options */}
        {(budgetText || parsedPrefs.priceLock === "locked" || parsedPrefs.exactItem || parsedPrefs.exactSpecification || parsedPrefs.exactPrice || (request.urgency && request.urgency !== "Standard") || request.country) && (
          <div className="flex items-center gap-4 flex-wrap mb-4 text-sm text-gray-500">
            {budgetText && <span>{budgetText}</span>}
            {parsedPrefs.priceLock === "locked" && <span>• Fixed budget</span>}
            {parsedPrefs.exactPrice && <span>• Fixed price</span>}
            {parsedPrefs.exactItem && <span>• Only exact item</span>}
            {parsedPrefs.exactSpecification && <span>• No alternatives allowed</span>}
            {request.urgency && request.urgency !== "Standard" && (
              <span>• {request.urgency}</span>
            )}
            {request.country && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {request.country}
              </span>
            )}
          </div>
        )}

        {/* Preferences and Dealbreakers */}
        {(visiblePreferences.length > 0 || visibleDealbreakers.length > 0) && (
          <div className="space-y-3 mb-4">
            {/* Preferences */}
        {visiblePreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visiblePreferences.map((pref: { label: string }, idx: number) => (
                <span
                  key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700"
                >
                    <span className="text-green-500 font-semibold text-base leading-none">+</span>
                  <span>{pref.label}</span>
                </span>
              ))}
              {remainingPreferences > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
                  +{remainingPreferences} more
                </span>
              )}
          </div>
        )}

            {/* Dealbreakers */}
        {visibleDealbreakers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visibleDealbreakers.map((deal: { label: string }, idx: number) => (
                <span
                  key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700"
                >
                    <span className="text-[#FF5F00] font-semibold text-base leading-none">-</span>
                  <span>{deal.label}</span>
                </span>
              ))}
              {remainingDealbreakers > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
                  +{remainingDealbreakers} more
                </span>
              )}
              </div>
            )}
          </div>
        )}

        {/* Images beneath preferences/dealbreakers - only show on feed variant */}
        {images.length > 0 && variant !== "detail" && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2">Preview</p>
            <div className="flex gap-2 overflow-x-auto">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative w-16 h-16 rounded-lg border border-[#e5e7eb] bg-gray-50 overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={imgUrl}
                    alt={`${request.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posted by - only show on detail variant */}
        {variant === "detail" && request.profiles?.username && (
          <div className="text-sm text-gray-500 mb-4">
            Posted by <span className="font-medium text-gray-700">@{request.profiles.username}</span>
          </div>
        )}

        {/* Reference links - only show on detail variant */}
        {variant === "detail" && links.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700">Reference links</p>
            <div className="space-y-1.5">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-600 hover:text-gray-900 underline break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Images at bottom - only show on detail variant */}
        {variant === "detail" && images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mb-4">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className="relative w-16 h-16 rounded-lg border border-[#e5e7eb] bg-gray-50 overflow-hidden flex-shrink-0"
              >
                <Image
                  src={imgUrl}
                  alt={`${request.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer: Meta info */}
          {request.submissionCount !== undefined && request.submissionCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-4 mt-auto">
            <span className="text-sm text-gray-500">
              {formatSubmissionCount(request.submissionCount)} proposals
            </span>
          </div>
          )}
    </CardContent>
  );

  return (
    <div className="relative">
      {variant === "detail" ? (
        <Card
          className={cn(
            "border-[#e5e7eb] bg-white flex flex-col hover:border-gray-300 transition-colors relative group"
          )}
        >
          {cardContent}
        </Card>
      ) : (
        <Link
          href={`/app/requests/${request.id}`}
          prefetch={true}
          className="block focus:outline-none"
        >
          <Card
            className={cn(
              "border-[#e5e7eb] bg-white flex flex-col hover:border-gray-300 transition-colors relative group",
              isFirst && isLast && "rounded-2xl",
              isFirst && !isLast && "rounded-t-2xl rounded-b-none",
              !isFirst && isLast && "rounded-b-2xl rounded-t-none",
              !isFirst && !isLast && "rounded-none",
              !isLast && "border-b-0"
            )}
          >
            {cardContent}
      </Card>
    </Link>
      )}
  </div>
  );
}

export const RequestCard = memo(RequestCardComponent);

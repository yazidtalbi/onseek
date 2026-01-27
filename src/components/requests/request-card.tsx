"use client";

import Link from "next/link";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatSubmissionCount } from "@/lib/utils/submissions";
import { formatBudget } from "@/lib/utils/format";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import type { RequestItem } from "@/lib/types";
import Image from "next/image";
import { MapPin, Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { Badge } from "@/components/ui/badge";

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
  request: RequestItem & { profiles?: { username?: string } };
  variant?: "feed" | "detail";
  isFavorite?: boolean;
  images?: string[];
  links?: string[];
  attributes?: Array<{ label: string; value: boolean }>;
  currentUserId?: string | null;
  isFirst?: boolean;
  isLast?: boolean;
  proposalCount?: number;
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
  proposalCount,
}: RequestCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
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
            {variant === "detail" && request.profiles?.username ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Link
                  href={`/app/profile/${request.profiles.username}`}
                  className="hover:text-gray-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{request.profiles.username}
                </Link>
                <span>•</span>
                <span>{timeAgo}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-500">{timeAgo}</p>
            )}
            {/* Title: Primary, outcome-oriented, max 2 lines */}
            <h3
          className={cn(
                "font-medium leading-snug line-clamp-2 text-[20px] text-foreground transition-colors",
                isFeed && "group-hover:text-[#7755FF]"
          )}
        >
              {request.title}
            </h3>
            {/* Budget and Location - only show on feed variant */}
            {isFeed && (budgetText || request.country) && (
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                {budgetText && <span>{budgetText}</span>}
                {budgetText && request.country && <span>•</span>}
                {request.country && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{request.country}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-1.5 flex-shrink-0 relative z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <FavoriteButton
              requestId={request.id}
              isFavorite={isFavorite}
            />
            <RequestMenu
              requestId={request.id}
              requestUserId={request.user_id}
              status={request.status}
              categories={request.categories}
            />
          </div>
        </div>

        {/* Match Indicator - only show on feed variant if matched */}
        {variant === "feed" && request.matchReason && (
          <div className="mb-3 flex items-center gap-2 text-xs text-[#7755FF] bg-[#7755FF]/10 px-3 py-1.5 rounded-full w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{request.matchReason}</span>
          </div>
        )}

        {/* Category Tags - hidden on home/requests page */}

        {/* Preferences and Dealbreakers - only show on feed variant */}
        {variant === "feed" && (visiblePreferences.length > 0 || visibleDealbreakers.length > 0) && (
          <div className="space-y-3 mb-4">
            {/* Preferences */}
        {visiblePreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visiblePreferences.map((pref: { label: string }, idx: number) => (
                <span
                  key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-sm text-gray-700"
                >
                    <Check className="h-4 w-4 text-green-500" />
                  <span>{pref.label}</span>
                </span>
              ))}
              {remainingPreferences > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-sm text-gray-700">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-sm text-amber-700"
                >
                    <X className="h-4 w-4 text-amber-500 opacity-70" />
                  <span>{deal.label}</span>
                </span>
              ))}
              {remainingDealbreakers > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-sm text-amber-700">
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
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(imgUrl);
                  }}
                  className="relative w-16 h-16 rounded-lg border border-[#e5e7eb] bg-gray-50 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={imgUrl}
                    alt={`${request.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        )}



        {/* Expanded Details Section - only show on detail variant */}
        {variant === "detail" && (
          <div className="space-y-6 pt-4">
            {/* Preferences */}
            {preferences.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.map((pref: { label: string }, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-sm text-gray-700"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{pref.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dealbreakers */}
            {dealbreakers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Dealbreakers</h4>
                <div className="flex flex-wrap gap-2">
                  {dealbreakers.map((deal: { label: string }, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-sm text-amber-700"
                    >
                      <X className="h-4 w-4 text-amber-500 opacity-70" />
                      <span>{deal.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Budget, Location, and Condition in same row */}
            {(budgetText || request.country || request.condition) && (
              <div className={cn(
                (preferences.length > 0 || dealbreakers.length > 0) && "border-t border-neutral-200",
                "pt-6 pb-6",
                (images.length > 0 || links.length > 0) && "border-b border-neutral-200"
              )}>
                <div className="flex gap-8 w-full">
                  {budgetText && (
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-2">Budget</h4>
                      <p className="text-sm text-neutral-600">{budgetText}</p>
                    </div>
                  )}
                  {request.country && (
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-2">Location</h4>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                        <MapPin className="h-4 w-4" />
                        <span>{request.country}</span>
                      </div>
                    </div>
                  )}
                  {request.condition && (
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-neutral-900 mb-2">Condition</h4>
                      <p className="text-sm text-neutral-600">{request.condition}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reference Images */}
            {images.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">Reference images</h4>
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImageIndex(index);
                        setPreviewImage(imgUrl);
                      }}
                      className="relative w-16 h-16 rounded-lg border border-[#e5e7eb] bg-gray-50 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${request.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Links */}
            {links.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-2">Reference links</h4>
                <div className="space-y-1.5">
                  {links.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-neutral-600 hover:text-neutral-900 underline break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer: Meta info - only show on feed variant */}
          {variant === "feed" && request.submissionCount !== undefined && request.submissionCount > 0 && (
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
          className="block focus:outline-none cursor-pointer"
          onClick={(e) => {
            // Don't navigate if clicking on favorite button or menu
            const target = e.target as HTMLElement;
            // Check if click is on favorite button (has aria-label with "favorite")
            if (target.closest('button[aria-label*="favorite"]')) {
              e.preventDefault();
              return;
            }
            // Check if click is on menu or menu items
            if (target.closest('[role="menu"]') || target.closest('[role="menuitem"]')) {
              e.preventDefault();
              return;
            }
          }}
        >
          <Card
            className={cn(
              "border-[#e5e7eb] bg-white flex flex-col hover:border-gray-300 hover:bg-[#f9fafb] transition-colors relative group h-full",
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
      {previewImage && (
        <ImagePreviewDialog
          images={images}
          currentIndex={previewImageIndex}
          alt={request.title}
          open={!!previewImage}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewImage(null);
            }
          }}
        />
      )}
  </div>
  );
}

export const RequestCard = memo(RequestCardComponent);

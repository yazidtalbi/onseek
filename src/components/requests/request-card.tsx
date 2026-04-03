"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { memo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatSubmissionCount } from "@/lib/utils/submissions";
import { formatBudget } from "@/lib/utils/format";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import type { RequestItem } from "@/lib/types";
import Image from "next/image";
import { MapPin, Check, X, Sparkles, Laptop, Gamepad2, ShoppingBag, HeartPulse, Baby, Home, Shovel, Car, Apple, Package, Watch, Smartphone, Tv, Gem, Headphones, Camera, Footprints, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { createRequestUrl } from "@/lib/utils/slug";

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

function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1] : url;
  }
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
  smallImages?: boolean;
  isPreview?: boolean;
  hideAttributes?: boolean;
  noBorder?: boolean;
  noPadding?: boolean;
  noRounding?: boolean;
  headerActions?: React.ReactNode;
  disableHover?: boolean;
  priority?: boolean;
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
  smallImages = false,
  isPreview = false,
  hideAttributes = false,
  noBorder = false,
  noPadding = false,
  noRounding = false,
  headerActions,
  disableHover = false,
  priority = false,
}: RequestCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !smallImages) return;

    const observer = new ResizeObserver(() => {
      // Buffer to avoid sub-pixel layout trashing
      if (el.scrollHeight > el.clientHeight + 15) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [smallImages]);
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
  const maxBudget = request.budget_max ? `$${request.budget_max}` : budgetText;
  const budgetDisplay = maxBudget ? `Budget of ${maxBudget}` : null;
  const isFeed = variant === "feed";

  const formattedCondition = (() => {
    const cond = request.condition?.toLowerCase();
    if (cond === "new") return "New condition";
    if (cond === "used") return "Used condition";
    if (cond === "either") return "Any condition";
    return request.condition;
  })();

  const shortMetadata = [
    formattedCondition
  ].filter(Boolean).join(" - ");

  const rawCategoryName =
    (request.categories && request.categories[request.categories.length - 1]?.name) ||
    request.category ||
    "Category";

  const primaryCategoryName = rawCategoryName.includes(">")
    ? rawCategoryName.split(">").pop()!.trim()
    : rawCategoryName;


  // Limit display for feed variant
  const maxImages = 4;
  const maxPreferences = isFeed || smallImages ? 3 : preferences.length;
  const maxDealbreakers = isFeed || smallImages ? 3 : dealbreakers.length;

  const visibleImages = images.slice(0, maxImages);
  const visiblePreferences = preferences.slice(0, maxPreferences);
  const visibleDealbreakers = dealbreakers.slice(0, maxDealbreakers);
  const remainingPreferences = preferences.length - maxPreferences;
  const remainingDealbreakers = dealbreakers.length - maxDealbreakers;
  const isInline = (preferences.length + dealbreakers.length) <= 2;
  const hasAttributes = visiblePreferences.length > 0 || visibleDealbreakers.length > 0;
  const hasContent = hasAttributes || !!request.description || (variant === "feed" && !!request.matchReason);

  const footerSection = (variant === "feed" || smallImages) && !isPreview && (
    <div
      className={cn(
        "flex items-center justify-between gap-3 flex-wrap",
        !smallImages && "pt-4 mt-auto border-t border-gray-100/60",
        smallImages && "p-2 pt-0"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 font-medium">
          {request.submissionCount !== undefined && request.submissionCount > 0
            ? formatSubmissionCount(request.submissionCount)
            : "Open for proposals"}
        </span>
        {!isPreview && <div className="w-[1px] h-3 bg-gray-300/60 shrink-0" />}
      </div>
      {!isPreview && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
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
      )}
    </div>
  );

  const cardContent = (
    <CardContent className={cn(
      "flex flex-col h-full",
      noPadding ? "p-0" : (isFeed ? "p-5" : variant === "detail" ? (smallImages ? (hasContent ? "px-5 py-4 sm:px-6 sm:py-5" : "px-5 py-3.5 sm:px-6 sm:py-4") : "p-6 sm:p-8 pb-24") : "p-6")
    )}>
      {/* Header Section */}
      <section>
        <div className="flex items-start gap-4">
          {/* Content - Left side */}
          <div className="flex-1 min-w-0">
            <div className="flex-1 min-w-0 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {variant === "detail" && request.profiles?.username && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Link
                        href={`/app/profile/${request.profiles.username}`}
                        className="hover:text-gray-700 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{request.profiles.username}
                      </Link>
                    </div>
                  )}
                  {/* Title & Category Row */}
                  {/* Title: Truncated to one line in preview modes */}
                  <h3
                    className={cn(
                      "font-semibold leading-snug text-foreground transition-colors font-[family-name:var(--font-inter-display)]",
                      variant === "detail" && !smallImages ? "text-4xl" : "text-[18px]",
                      !headerActions && "pr-24"
                    )}
                    style={variant === "detail" && !smallImages ? { letterSpacing: '-1.2px' } : undefined}
                  >
                    {request.title}
                  </h3>
                </div>
                {variant === "detail" && headerActions && (
                  <div className="flex-shrink-0 pt-1">
                    {headerActions}
                  </div>
                )}
              </div>
              {/* Concise preview metadata: Condition - Location */}
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {(isFeed || smallImages) && shortMetadata && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium bg-[#f9f9f9] text-gray-500 shrink-0 tracking-tight">
                    {shortMetadata}
                  </span>
                )}
                {(isFeed || smallImages) && budgetDisplay && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[13px] font-medium bg-[#f8f7ff] text-[#785ffe] shrink-0 tracking-tight">
                    {parsedPrefs.priceLock === "locked" && <LockKeyhole className="h-3.5 w-3.5" />}
                    {budgetDisplay}
                  </span>
                )}
              </div>
              {/* Detailed budget/location only for non-preview feed cards if needed, 
                  but we'll prioritize the new single-line metadata for now */}
              {isFeed && !shortMetadata && (budgetText || request.country || timeAgo) && (
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  {budgetText && <span>{budgetText}</span>}
                  {budgetText && (request.country || timeAgo) && <span>•</span>}
                  {request.country && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{request.country}</span>
                    </div>
                  )}
                  {request.country && timeAgo && <span>•</span>}
                  {timeAgo && <span>{timeAgo}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Image / Category placeholder - Right side (shown in feed or with smallImages prop) */}
        </div>
      </section>

      {/* Separator between header and preferences */}

      {/* Main Content Section */}
      <section className={cn("flex flex-col justify-center", hasContent && "flex-1")}>
        {/* Match Indicator - only show on feed variant if matched */}
        {variant === "feed" && request.matchReason && (
          <div className="mb-2 flex items-center gap-2 text-xs text-[#7755FF] bg-[#7755FF]/10 px-3 py-1.5 rounded-full w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{request.matchReason}</span>
          </div>
        )}

        {/* Category Tags - hidden on home/requests page */}

        {/* Preferences and Dealbreakers - only show on feed variant */}
        {variant === "feed" && (visiblePreferences.length > 0 || visibleDealbreakers.length > 0) && (
          <div className={cn(
            "border-l border-dashed border-neutral-300/60 pl-4 mt-4 mb-3 flex gap-2",
            isInline ? "flex-wrap items-center" : "flex-col gap-3"
          )}>
            {visiblePreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visiblePreferences.map((pref: { label: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-[#015a25] text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                    {pref.label.charAt(0).toUpperCase() + pref.label.slice(1)}
                  </div>
                ))}
                {remainingPreferences > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-sm text-[#015a25]">
                    +{remainingPreferences} more
                  </span>
                )}
              </div>
            )}

            {visibleDealbreakers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {visibleDealbreakers.map((deal: { label: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-[#92400e] text-sm">
                    <X className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                    {deal.label.charAt(0).toUpperCase() + deal.label.slice(1)}
                  </div>
                ))}
                {remainingDealbreakers > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-sm text-[#92400e]">
                    +{remainingDealbreakers} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}




        {/* Expanded Details Section - only show on detail variant */}
        {variant === "detail" && (
          <div className="space-y-5 pt-3">
            {/* Budget, Location, and Condition - now redundant on home page previews */}
            {!smallImages && (budgetText || request.country || request.condition) && (
              <div className="flex gap-10 w-full justify-start">
                {budgetText && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Budget</h4>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-900">
                      {parsedPrefs.priceLock === "locked" && <LockKeyhole className="h-3.5 w-3.5 text-gray-400" />}
                      <span>{budgetText}</span>
                    </div>
                  </div>
                )}
                {request.country && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Location</h4>
                    <div className="flex items-center gap-1.5 text-sm text-neutral-900">
                      <MapPin className="h-4 w-4" />
                      <span>{request.country}</span>
                    </div>
                  </div>
                )}
                {request.condition && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Condition</h4>
                    <p className="text-sm text-neutral-900">{formattedCondition}</p>
                  </div>
                )}
              </div>
            )}

            {(preferences.length > 0 || dealbreakers.length > 0) && (
              <div className={cn(
                variant === "detail" && !smallImages ? "space-y-6 pt-2" : "border-l border-dashed border-neutral-300/60 pl-5 mt-4 mb-4",
                isInline && variant !== "detail" ? "flex flex-wrap gap-2" : (variant === "detail" && !smallImages ? "space-y-5" : "space-y-4")
              )}>
                {preferences.length > 0 && (
                  <div className="space-y-3">
                    {variant === "detail" && !smallImages && <h4 className="text-sm font-semibold text-gray-400">Preferences</h4>}
                    <div className="flex flex-wrap gap-2">
                      {visiblePreferences.map((pref: { label: string }, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-[#015a25] text-sm">
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                          {pref.label.charAt(0).toUpperCase() + pref.label.slice(1)}
                        </div>
                      ))}
                      {remainingPreferences > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-sm text-[#015a25]">
                          +{remainingPreferences} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {dealbreakers.length > 0 && (
                  <div className="space-y-3">
                    {variant === "detail" && !smallImages && <h4 className="text-sm font-semibold text-gray-400">Dealbreakers</h4>}
                    <div className="flex flex-wrap gap-2">
                      {visibleDealbreakers.map((deal: { label: string }, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-[#92400e] text-sm">
                          <X className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                          {deal.label.charAt(0).toUpperCase() + deal.label.slice(1)}
                        </div>
                      ))}
                      {remainingDealbreakers > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-sm text-[#92400e]">
                          +{remainingDealbreakers} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reference Images - Hide on home feed if smallImages is true */}
            {images.length > 0 && !smallImages && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Reference images</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImageIndex(index);
                        setPreviewImage(imgUrl);
                      }}
                      className="relative w-12 h-12 flex-shrink-0 rounded-md bg-gray-50 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-100"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${request.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                        priority={priority && index === 0}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reference Links */}
            {links.length > 0 && !smallImages && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Reference links</h4>
                <div className="space-y-1.5">
                  {links.map((link, index) => {
                    const fullUrl = link.startsWith('http') ? link : `https://${link}`;
                    const domain = getDomainFromUrl(link);
                    return (
                      <a
                        key={index}
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={fullUrl}
                        className="block text-sm text-neutral-600 hover:text-neutral-900 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {domain}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Images at the absolute bottom for feed cards */}
      {(isFeed || smallImages) && visibleImages.length > 0 && (
        <div className="mt-auto pt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {visibleImages.map((imgUrl, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImageIndex(index);
                setPreviewImage(imgUrl);
              }}
              className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-md bg-gray-50 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-100"
            >
              <Image
                src={imgUrl}
                alt={`${request.title} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 40px, 48px"
                priority={priority && index === 0}
              />
            </button>
          ))}
        </div>
      )}

      {/* Footer Section - rendered inside card only if NOT smallImages (detail page) */}
      {!smallImages && footerSection}
    </CardContent>
  );

  return (
    <div className="relative group w-full">
      {variant === "detail" ? (
        <div className="flex flex-col gap-3">
          {smallImages ? (
            <Link
              href={createRequestUrl(request.id, searchParams)}
              prefetch={true}
              scroll={false}
              className="block h-full group/card"
            >
              <Card
                ref={cardRef}
                className={cn(
                  "flex flex-col relative w-full bg-white shadow-none transition-all duration-300 ease-out",
                  !noRounding && "overflow-hidden rounded-2xl",
                  noRounding && "rounded-none",
                  noBorder ? "!border-none !shadow-none bg-white" : "border border-[#e5e7eb]",
                  hasContent ? "h-full" : "h-fit",
                  smallImages && !noBorder && !disableHover && "group-hover/card:scale-[1.02]"
                )}
              >
                {cardContent}
                {isOverflowing && smallImages && (
                  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-6 z-10 pointer-events-none rounded-b-2xl">
                    <span className="text-sm font-medium text-[#7755FF] bg-white backdrop-blur-sm px-6 py-2 rounded-full shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] border border-[#e5e7eb]">
                      View more...
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          ) : (
            <Card
              ref={cardRef}
              className={cn(
                "flex flex-col relative w-full bg-white shadow-none transition-all duration-300 ease-out",
                !noRounding && "overflow-hidden rounded-2xl",
                noRounding && "rounded-none",
                noBorder ? "!border-none !shadow-none bg-white" : "border border-[#e5e7eb]",
                hasContent ? "h-full" : "h-fit"
              )}
            >
              {cardContent}
            </Card>
          )}
          {smallImages && (
            <div className="px-4">
              {footerSection}
            </div>
          )}
        </div>
      ) : isPreview ? (
        <Card
          className={cn(
            "flex flex-col relative group transition-all duration-300 ease-out",
            noRounding ? "rounded-none" : "rounded-2xl",
            noBorder ? "border-none" : "border border-[#e5e7eb]",
            hasContent ? "h-full" : "h-fit"
          )}
        >
          {cardContent}
        </Card>
      ) : (
        <div
          onClick={(e) => {
            // Don't navigate if clicking on favorite button or menu
            const target = e.target as HTMLElement;
            if (target.closest('button[aria-label*="favorite"]')) {
              return;
            }
            if (target.closest('[role="menu"]') || target.closest('[role="menuitem"]')) {
              return;
            }
            // Also stop if clicking on the profile link specifically
            if (target.closest('a')) {
              return;
            }

            router.push(createRequestUrl(request.id, searchParams), { scroll: false });
          }}
          className="block focus:outline-none cursor-pointer"
        >
          <Card
            className={cn(
              "flex flex-col transition-all duration-300 ease-out relative group",
              !noBorder && !disableHover && "hover:scale-[1.02]",
              hasContent ? "h-full" : "h-fit",
              !noBorder && !isFeed && !noRounding ? "rounded-2xl" : "",
              !noBorder && isFeed && isFirst && isLast && !noRounding ? "rounded-2xl" : "",
              !noBorder && isFeed && isFirst && !isLast && !noRounding ? "rounded-t-2xl rounded-b-none" : "",
              !noBorder && isFeed && isLast && !isFirst && !noRounding ? "rounded-b-2xl rounded-t-none border-t-0" : "",
              !noBorder && isFeed && !isFirst && !isLast ? "rounded-none border-t-0" : "",
              noBorder && cn("!border-none !shadow-none bg-white", noRounding ? "rounded-none" : "rounded-2xl")
            )}
          >
            {cardContent}
          </Card>
        </div>
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

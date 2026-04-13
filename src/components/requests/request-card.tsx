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
import { MapPin, Check, X, Sparkles, Laptop, Gamepad2, ShoppingBag, HeartPulse, Baby, Home, Shovel, Car, Apple, Package, Watch, Smartphone, Tv, Gem, Headphones, Camera, Footprints, LockKeyhole, Wallet } from "lucide-react";
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
  isAdmin?: boolean;
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
  isAdmin = false,
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
  const editedFields = parsedPrefs.editedFields as string[] || [];

  const budgetText = formatBudget(request.budget_min, request.budget_max);
  const maxBudget = request.budget_max ? `$${request.budget_max}` : budgetText;
  const budgetDisplay = maxBudget ? `Budget of ${maxBudget}` : null;
  const isFeed = variant === "feed";

  const formattedCondition = (() => {
    const cond = request.condition?.toLowerCase();
    if (cond === "new") return "New";
    if (cond === "used") return "Used";
    if (cond === "either") return "New & Used";
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-medium">
            {request.submissionCount !== undefined && request.submissionCount > 0
              ? formatSubmissionCount(request.submissionCount)
              : "Open for proposals"}
          </span>
          <span className="text-[13px] text-gray-300 font-medium">
            by @{request.profiles?.username || 'user'}
          </span>
        </div>
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
            isAdmin={isAdmin}
            initialData={{ ...request, images, links }}
          />
        </div>
      )}
    </div>
  );

  const isFeedView = variant === "feed";

  const cardContent = isFeedView ? (
    <div className="flex flex-col h-full bg-white border border-gray-100 shadow-none relative transition-colors hover:border-gray-200">
      {/* Header with Title */}
      <div className="px-6 pt-8 pb-4">
        <h3
          className="text-[22px] sm:text-[24px] font-bold leading-[1.1] text-[#7755FF] tracking-tight font-[family-name:var(--font-inter-display)] pr-8"
          style={{ fontFamily: "'Zalando Sans', sans-serif" }}
        >
          {request.title}
          {request.status === "pending" && (
            <span className="ml-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded-sm inline-flex items-center gap-1.5 align-middle">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              Pending
            </span>
          )}
        </h3>
      </div>

      <div className="px-6 flex flex-col flex-1">
        {/* Editorial Requirements List */}
        <div className="flex flex-col">
          {(() => {
            const allItems = [
              ...visiblePreferences.map((p: { label: string }) => ({ ...p, type: 'pref' })),
              ...visibleDealbreakers.map((d: { label: string }) => ({ ...d, type: 'deal' }))
            ];
            const displayedItems = allItems.slice(0, 5);
            const remainingCount = allItems.length - 5;

            return (
              <>
                {displayedItems.map((item: any, idx) => (
                  <div
                    key={`${item.type}-${idx}`}
                    className={cn(
                      "flex items-center gap-4 py-4 group/item",
                      (idx !== displayedItems.length - 1 || remainingCount > 0) && "border-b border-dashed border-gray-200"
                    )}
                  >
                    {item.type === 'pref' ? (
                      <Check className="h-4 w-4 text-[#16a34a] shrink-0" strokeWidth={3} />
                    ) : (
                      <X className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={3} />
                    )}
                    <span className={cn(
                      "text-[16px] sm:text-[18px] font-medium leading-snug tracking-tight",
                      item.type === 'pref' ? "text-[#1A1A1A]" : "text-gray-400"
                    )}>
                      {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                    </span>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div className="py-4 text-[16px] sm:text-[18px] font-medium text-gray-400">
                    + {remainingCount} more {remainingCount === 1 ? 'requirement' : 'requirements'}
                  </div>
                )}
              </>
            );
          })()}

          {/* Fallback if no requirements */}
          {visiblePreferences.length === 0 && visibleDealbreakers.length === 0 && (
            <div className="py-6 border-b border-gray-50 italic text-gray-400 text-sm">
              No specific requirements listed.
            </div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="flex items-center gap-8 py-6">
          {shortMetadata && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Condition</span>
              <span className="text-[16px] sm:text-[18px] font-semibold text-[#d97706]">{shortMetadata}</span>
            </div>
          )}
          {budgetDisplay && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Budget</span>
              <div className="flex items-center gap-1.5 text-[16px] sm:text-[18px] font-semibold text-[#d97706]">
                {parsedPrefs.priceLock === "locked" && <LockKeyhole className="h-3.5 w-3.5" />}
                {maxBudget}
              </div>
            </div>
          )}
        </div>

        {/* Reference Images Inline */}
        {visibleImages.length > 0 && (
          <div className="mt-2 mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {visibleImages.map((imgUrl, index) => (
              <div
                key={index}
                className="relative w-12 h-12 flex-shrink-0 bg-gray-50 overflow-hidden border border-gray-100"
              >
                <Image src={imgUrl} alt={`${request.title} - Image ${index + 1}`} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-300" sizes="48px" />
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto py-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-bold text-black uppercase tracking-tight">
              {request.submissionCount !== undefined && request.submissionCount > 0
                ? formatSubmissionCount(request.submissionCount)
                : "Active Board"}
            </span>
          </div>

          {!isPreview && (
            <div className="flex items-center gap-2">
              <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
              <RequestMenu
                requestId={request.id}
                requestUserId={request.user_id}
                status={request.status}
                categories={request.categories}
                isAdmin={isAdmin}
                initialData={{ ...request, images, links }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <CardContent className={cn(
      "flex flex-col h-full",
      noPadding ? "p-0" : (isFeed ? "p-5" : variant === "detail" ? (smallImages ? (hasContent ? "px-5 py-4 sm:px-6 sm:py-5" : "px-5 py-3.5 sm:px-6 sm:py-4") : "p-6 sm:p-8 pb-24") : "p-6")
    )}>
      {/* Header Section */}
      <section className={cn(smallImages && !request.profiles?.username && !request.title && "hidden")}>
        <div className="flex items-start gap-4">
          {/* Content - Left side */}
          <div className="flex-1 min-w-0">
            <div className="flex-1 min-w-0 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {variant === "detail" && request.profiles?.username && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Link
                        href={`/profile/${request.profiles.username}`}
                        className="hover:text-gray-700 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{request.profiles.username}
                      </Link>
                    </div>
                  )}
                  {/* Title & Category Row */}
                  {/* Title: Truncated to one line in preview modes */}
                  <div className={cn(smallImages ? "flex items-center justify-between gap-3 mb-2" : "block")}>
                    <h3
                      className={cn(
                        "font-semibold leading-snug text-[#7755FF] transition-colors",
                        variant === "detail" && !smallImages ? "text-4xl" : "text-[18px]",
                        smallImages && "line-clamp-2 pr-4",
                        !headerActions && !smallImages && "pr-24"
                      )}
                      style={{
                        fontFamily: "'Zalando Sans', sans-serif",
                        ...(variant === "detail" && !smallImages ? { letterSpacing: '-1.2px' } : {})
                      }}
                    >
                      {request.title}
                      {request.status === "pending" && (
                        <span className="ml-3 text-[10px] font-bold text-[#7755FF] uppercase tracking-widest bg-[#7755FF]/10 px-2 py-0.5 rounded-full border border-[#7755FF]/20 inline-flex items-center gap-1 align-middle">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7755FF] animate-pulse" />
                          Pending Review
                        </span>
                      )}
                      {editedFields.length > 0 && (
                        <span className="ml-3 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded inline-flex items-center">Edited</span>
                      )}
                    </h3>
                    {smallImages && visibleImages.length > 0 && (
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-md bg-gray-50 overflow-hidden border border-gray-100">
                        <Image
                          src={visibleImages[0]}
                          alt={request.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          priority={priority}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {variant === "detail" && headerActions && (
                  <div className="flex-shrink-0 pt-1">
                    {headerActions}
                  </div>
                )}
              </div>
              {/* Concise preview metadata: Condition - Location */}
              {isFeed && (
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {shortMetadata && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium bg-[#f9f9f9] text-gray-500 shrink-0 tracking-tight">
                      {shortMetadata}
                    </span>
                  )}
                  {budgetDisplay && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[13px] font-medium bg-[#f8f7ff] text-[#785ffe] shrink-0 tracking-tight">
                      {parsedPrefs.priceLock === "locked" && <LockKeyhole className="h-3.5 w-3.5" />}
                      {budgetDisplay}
                    </span>
                  )}
                </div>
              )}
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
        {/* Match Indicator - only shown in feed view (which is now handled in the main if branch) */}


        {/* Preferences and Dealbreakers - feed view is handled in the main if branch */}





        {/* Expanded Details Section - only show on detail variant */}
        {variant === "detail" && (
          <div className={cn("space-y-5", !smallImages && "pt-3")}>
            {/* Budget, Location, and Condition - now redundant on home page previews */}
            {!smallImages && (budgetText || request.country || request.condition) && (
              <div className="flex gap-10 w-full justify-start">
                {budgetText && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Budget</h4>
                    <div className="flex items-center gap-1.5 text-[15.5px] font-medium text-neutral-900">
                      {parsedPrefs.priceLock === "locked" && <LockKeyhole className="h-3.5 w-3.5 text-gray-400" />}
                      <span>{budgetText}</span>
                    </div>
                  </div>
                )}
                {request.country && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Location</h4>
                    <div className="flex items-center gap-1.5 text-[15.5px] font-medium text-neutral-900">
                      <MapPin className="h-4 w-4" />
                      <span>{request.country}</span>
                    </div>
                  </div>
                )}
                {request.condition && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Condition</h4>
                    <p className="text-[16px] sm:text-[18px] font-semibold text-[#d97706]">{formattedCondition}</p>
                  </div>
                )}
              </div>
            )}

            {(preferences.length > 0 || dealbreakers.length > 0) && (
              <div className="flex flex-col">
                {(() => {
                  const allItems = [
                    ...visiblePreferences.map((p: { label: string }) => ({ ...p, type: 'pref' })),
                    ...visibleDealbreakers.map((d: { label: string }) => ({ ...d, type: 'deal' }))
                  ];
                  const displayedItems = allItems.slice(0, 5);
                  const remainingCount = allItems.length - 5;

                  return (
                    <>
                      {displayedItems.map((item: any, idx) => (
                        <div
                          key={`${item.type}-detail-${idx}`}
                          className={cn(
                            "flex items-center gap-4 py-4 group/item",
                            (idx !== displayedItems.length - 1 || remainingCount > 0) && "border-b border-dashed border-gray-200"
                          )}
                        >
                          {item.type === 'pref' ? (
                            <Check className="h-4 w-4 text-[#16a34a] shrink-0" strokeWidth={3} />
                          ) : (
                            <X className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={3} />
                          )}
                          <span className={cn(
                            "text-[16px] sm:text-[18px] font-medium leading-snug tracking-tight",
                            item.type === 'pref' ? "text-[#1A1A1A]" : "text-gray-400"
                          )}>
                            {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                          </span>
                        </div>
                      ))}
                      {remainingCount > 0 && (
                        <div className="py-4 text-[16px] sm:text-[18px] font-medium text-gray-400">
                          + {remainingCount} more {remainingCount === 1 ? 'requirement' : 'requirements'}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Render condition and budget right under tags for smallImages */}
            {smallImages && (shortMetadata || maxBudget) && (
              <div className="mt-5">
                <div className="h-1 bg-[#f7f8f9] -mx-5 sm:-mx-6" />
                <div className="flex items-stretch -mx-5 sm:-mx-6 -mb-4 sm:-mb-5">
                  {shortMetadata && (
                    <div className="flex flex-col items-center flex-1 py-4 justify-center min-w-0 px-2">
                      <span className="text-[13px] text-gray-400 font-normal leading-none mb-1.5 text-center">Condition</span>
                      <span className="text-[16px] sm:text-[18px] font-semibold text-[#d97706] tracking-tight leading-tight text-center truncate w-full">
                        {shortMetadata}
                      </span>
                    </div>
                  )}
                  {shortMetadata && maxBudget && (
                    <div className="w-1 bg-[#f7f8f9] shrink-0" />
                  )}
                  {maxBudget && (
                    <div className="flex flex-col items-center flex-1 py-4 justify-center min-w-0 px-2">
                      <span className="text-[13px] text-gray-400 font-normal leading-none mb-1.5 text-center">Budget</span>
                      <span className="text-[18px] sm:text-[20px] font-semibold text-[#d97706] tracking-tight leading-tight text-center truncate w-full">
                        {maxBudget}
                      </span>
                    </div>
                  )}
                </div>
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

      {/* Images section for feed is now handled in the main if branch */}


      {/* Footer Section - rendered inside card only if NOT smallImages (detail page) */}
      {!smallImages && footerSection}
    </CardContent>
  );

  return (
    <div className="relative group w-full">
      {variant === "detail" ? (
        <div className="flex flex-col gap-3">
          {smallImages ? (
            <div className="flex flex-col gap-3">
              <Link
                href={createRequestUrl(request.slug, searchParams)}
                prefetch={true}
                scroll={false}
                className="flex flex-col h-full group/card bg-[#f5f6f9] rounded-[20px]"
              >
                <Card
                  ref={cardRef}
                  className={cn(
                    "flex flex-col relative w-full bg-white shadow-none transition-all duration-300 ease-out",
                    !noRounding && "overflow-hidden rounded-[20px]",
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
              <div className="px-2 pt-1 pb-1">
                {footerSection}
              </div>
            </div>
          ) : (
            <Card
              ref={cardRef}
              className={cn(
                "flex flex-col relative w-full bg-white shadow-none transition-all duration-300 ease-out",
                "overflow-hidden rounded-none",
                noBorder ? "!border-none !shadow-none bg-white" : "border border-[#e5e7eb]",
                hasContent ? "h-full" : "h-fit"
              )}
            >
              {cardContent}
            </Card>
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

            router.push(createRequestUrl(request.slug, searchParams), { scroll: false });
          }}
          className="block focus:outline-none cursor-pointer"
        >
          <Card
            className={cn(
              "flex flex-col transition-all duration-300 ease-out relative group shadow-none",
              hasContent ? "h-full" : "h-fit",
              isFeedView ? "border-0 bg-transparent" : cn(
                "rounded-none",
                noBorder && cn("!border-none !shadow-none bg-white", "rounded-none")
              )
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

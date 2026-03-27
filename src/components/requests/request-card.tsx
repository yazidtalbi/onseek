"use client";

import Link from "next/link";
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
import { MapPin, Check, X, Sparkles, Laptop, Gamepad2, ShoppingBag, HeartPulse, Baby, Home, Shovel, Car, Apple, Package, Watch, Smartphone, Tv, Gem, Headphones, Camera, Footprints } from "lucide-react";
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
}: RequestCardProps) {
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
  const isFeed = variant === "feed";

  const formattedCondition = request.condition?.toLowerCase() === "new" ? "Brand New" : request.condition;

  const shortMetadata = [
    maxBudget ? `Budget up to ${maxBudget}` : null,
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
  const maxImages = 3;
  const maxPreferences = isFeed ? 4 : preferences.length;
  const maxDealbreakers = isFeed ? 3 : dealbreakers.length;

  const visibleImages = images.slice(0, maxImages);
  const visiblePreferences = preferences.slice(0, maxPreferences);
  const visibleDealbreakers = dealbreakers.slice(0, maxDealbreakers);
  const remainingPreferences = preferences.length - maxPreferences;
  const remainingDealbreakers = dealbreakers.length - maxDealbreakers;

  const cardContent = (
    <CardContent className={cn("flex flex-col h-full", isFeed ? "p-5" : variant === "detail" ? (smallImages ? "p-5 sm:p-6" : "p-6 sm:p-8 pb-24") : "p-6")}>
      {/* Header Section */}
      <section>
        <div className="flex items-start gap-3 mb-3">
          {/* Image / Category placeholder - Left side (shown in feed or with smallImages prop) */}
          {(isFeed || smallImages) && (
            <div className="flex-shrink-0">
              {images.length > 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(images[0]);
                  }}
                  className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-50 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={images[0]}
                    alt={`${request.title} - Image 1`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 48px, 56px"
                    unoptimized
                  />
                </button>
              ) : (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100/60 flex items-center justify-center">
                  {(() => {
                    const iconProps = { className: "w-6 h-6 sm:w-7 sm:h-7 text-gray-400" };
                    const lower = primaryCategoryName.toLowerCase();

                    // High-priority specific items
                    if (lower.includes("watch")) return <Watch {...iconProps} />;
                    if (lower.includes("car") || lower.includes("auto")) return <Car {...iconProps} />;
                    if (lower.includes("laptop") || lower.includes("comput")) return <Laptop {...iconProps} />;
                    if (lower.includes("phone") || lower.includes("smartphone") || lower.includes("telephony")) return <Smartphone {...iconProps} />;
                    if (lower.includes("game") || lower.includes("gaming") || lower.includes("console")) return <Gamepad2 {...iconProps} />;
                    if (lower.includes("tv") || lower.includes("video")) return <Tv {...iconProps} />;
                    if (lower.includes("headphone") || lower.includes("audio")) return <Headphones {...iconProps} />;
                    if (lower.includes("camera") || lower.includes("photo")) return <Camera {...iconProps} />;
                    if (lower.includes("sneaker") || lower.includes("shoes") || lower.includes("footwear")) return <Footprints {...iconProps} />;
                    if (lower.includes("jewelry") || lower.includes("gem")) return <Gem {...iconProps} />;

                    // Category fallbacks
                    if (lower.includes("tech")) return <Laptop {...iconProps} />;
                    if (lower.includes("fashion")) return <ShoppingBag {...iconProps} />;
                    if (lower.includes("health") || lower.includes("cosmetic") || lower.includes("beauty")) return <HeartPulse {...iconProps} />;
                    if (lower.includes("family") || lower.includes("child")) return <Baby {...iconProps} />;
                    if (lower.includes("home") || lower.includes("living") || lower.includes("furniture")) return <Home {...iconProps} />;
                    if (lower.includes("garden") || lower.includes("diy")) return <Shovel {...iconProps} />;
                    if (lower.includes("grocer") || lower.includes("food")) return <Apple {...iconProps} />;

                    return <Package {...iconProps} />;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Content - Right side */}
          <div className="flex-1 min-w-0">
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
                  "font-bold leading-snug text-[18px] text-foreground transition-colors font-[family-name:var(--font-inter-display)]",
                  (isFeed || smallImages) && "line-clamp-1"
                )}
              >
                {request.title}
              </h3>
              {/* Concise preview metadata: Budget - Condition - Location */}
              {(isFeed || smallImages) && shortMetadata && (
                <div className="mt-1 text-sm text-gray-500 line-clamp-1">
                  {shortMetadata}
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
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1">
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
          <div className="flex gap-6 mb-3 mt-3">
            {/* Preferences */}
            {visiblePreferences.length > 0 && (
              <div className="flex-1">
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
              </div>
            )}

            {/* Dealbreakers */}
            {visibleDealbreakers.length > 0 && (
              <div className="flex-1">
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
                    <p className="text-sm text-neutral-900">{budgetText}</p>
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

            {/* Preferences */}
            {(preferences.length > 0 || smallImages) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.length > 0 ? (
                    <>
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
                    </>
                  ) : (
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100/60 text-sm text-gray-500/80">
                      No preferences
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Dealbreakers */}
            {(dealbreakers.length > 0 || smallImages) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Dealbreakers</h4>
                <div className="flex flex-wrap gap-2">
                  {dealbreakers.length > 0 ? (
                    <>
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
                    </>
                  ) : (
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-gray-100/60 text-sm text-gray-500/80">
                      No dealbreakers
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reference Images - Hide on home feed if smallImages is true */}
            {images.length > 0 && !smallImages && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Reference images</h4>
                <div className={cn("grid gap-4 items-start", smallImages ? "grid-cols-1" : "grid-cols-1 mb-4")}>
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImageIndex(index);
                        setPreviewImage(imgUrl);
                      }}
                      className="relative w-full aspect-square rounded-lg bg-gray-50 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${request.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 360px"
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
                <h4 className="text-sm font-semibold text-gray-400 mb-1.5">Reference links</h4>
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

      {/* Footer Section */}
      <section>
        {/* Footer: Meta info & actions - show on feed or with smallImages prop */}
        {(variant === "feed" || smallImages) && (
          <div className="flex items-center justify-between gap-2 flex-wrap pt-4 mt-auto">
            <span className="text-sm text-gray-500">
              {request.submissionCount !== undefined && request.submissionCount > 0
                ? `${formatSubmissionCount(request.submissionCount)} proposals`
                : "No proposals yet"}
            </span>
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
        )}
      </section>
    </CardContent>
  );

  return (
    <div className="relative h-full w-full">
      {variant === "detail" ? (
        <Card
          ref={cardRef}
          className={cn(
            "flex flex-col transition-colors relative group h-full w-full rounded-2xl border border-[#e5e7eb] overflow-hidden"
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
      ) : (
        <Link
          href={createRequestUrl(request.id)}
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
              " flex flex-col transition-all relative group h-full",
              !isFeed ? "rounded-2xl" : "",
              isFeed && isFirst && isLast ? "rounded-2xl" : "",
              isFeed && isFirst && !isLast ? "rounded-t-2xl rounded-b-none" : "",
              isFeed && isLast && !isFirst ? "rounded-b-2xl rounded-t-none border-t-0" : "",
              isFeed && !isFirst && !isLast ? "rounded-none border-t-0" : ""
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

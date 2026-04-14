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
import { MapPin, Check, X, Sparkles, Laptop, Gamepad2, ShoppingBag, HeartPulse, Baby, Home, Shovel, Car, Apple, Package, Watch, Smartphone, Tv, Gem, Headphones, Camera, Footprints, LockKeyhole, Wallet, Pencil, GripVertical, Plus } from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { createRequestUrl } from "@/lib/utils/slug";
import { getRequestTheme } from "@/lib/utils/request-themes";

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

function getTheme(category: string) {
  const c = (category || "").toLowerCase();
  if (c.includes("tech") || c.includes("electronics")) return { bg: "bg-blue-50/60", text: "text-blue-900" };
  if (c.includes("grocery") || c.includes("food")) return { bg: "bg-emerald-50/60", text: "text-emerald-900" };
  if (c.includes("fashion") || c.includes("accessory") || c.includes("beauty")) return { bg: "bg-purple-50/60", text: "text-purple-900" };
  if (c.includes("family") || c.includes("kids") || c.includes("baby")) return { bg: "bg-pink-50/60", text: "text-pink-900" };
  if (c.includes("home") || c.includes("living") || c.includes("garden")) return { bg: "bg-orange-50/60", text: "text-orange-900" };
  if (c.includes("gaming") || c.includes("console") || c.includes("entertainment")) return { bg: "bg-indigo-50/60", text: "text-indigo-900" };
  if (c.includes("automotive") || c.includes("car")) return { bg: "bg-slate-50/60", text: "text-slate-900" };
  if (c.includes("health")) return { bg: "bg-cyan-50/60", text: "text-cyan-900" };
  if (c.includes("travel") || c.includes("service")) return { bg: "bg-teal-50/60", text: "text-teal-900" };
  return { bg: "bg-[#f5f6f9]", text: "text-[#1A1A1A]" };
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
  onEditField?: (field: 'title' | 'condition' | 'budget' | 'preferences' | 'dealbreakers' | 'images') => void;
  onUpdateTitle?: (title: string) => void;
  onUpdateRequirement?: (index: number, label: string) => void;
  onReorderRequirements?: (newItems: any[]) => void;
  showAllRequirements?: boolean;
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
  onEditField,
  onUpdateTitle,
  onUpdateRequirement,
  onReorderRequirements,
  showAllRequirements = false,
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
  const maxBudget = request.budget_max ? `$${request.budget_max}` : (budgetText || "---");
  const budgetDisplay = maxBudget !== "---" ? `Budget of ${maxBudget}` : "---";
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
          <span className="text-sm text-gray-400 font-medium whitespace-nowrap">
            by @{request.profiles?.username || 'user'}
          </span>
        </div>
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
        {isPreview ? (
          <textarea
            className={cn(
              "w-full text-[22px] sm:text-[24px] font-bold leading-[1.1] tracking-tight font-[family-name:var(--font-inter-display)] bg-transparent border-none outline-none resize-none overflow-hidden p-0",
              getRequestTheme(request.category).text
            )}
            style={{ fontFamily: "'Zalando Sans', sans-serif" }}
            value={request.title}
            onChange={(e) => onUpdateTitle?.(e.target.value)}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        ) : (
          <h3
            className={cn(
              "text-[22px] sm:text-[24px] font-bold leading-[1.1] text-[#7755FF] tracking-tight font-[family-name:var(--font-inter-display)] pr-8 relative group/edit",
            )}
            style={{ fontFamily: "'Zalando Sans', sans-serif" }}
          >
            {request.status === "pending" && (
              <span className="ml-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded-sm inline-flex items-center gap-1.5 align-middle">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                Pending
              </span>
            )}
            {request.title}
          </h3>
        )}
      </div>



      <div className="px-6 flex flex-col flex-1">
        {/* Editorial Requirements List */}
        <div className="flex flex-col">
          {(() => {
            const allItems = [
              ...visiblePreferences.map((p: { label: string }, idx: number) => ({ ...p, type: 'pref', id: `pref-${idx}` })),
              ...visibleDealbreakers.map((d: { label: string }, idx: number) => ({ ...d, type: 'deal', id: `deal-${idx}` }))
            ];
            const displayedItems = (isPreview || showAllRequirements) ? allItems : allItems.slice(0, 5);
            const remainingCount = (isPreview || showAllRequirements) ? 0 : allItems.length - 5;

            if (isPreview) {
              return (
                <Reorder.Group axis="y" values={allItems} onReorder={(newItems) => onReorderRequirements?.(newItems)}>
                  {allItems.map((item, idx) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      className={cn(
                        "flex items-center gap-4 py-4 group/item relative",
                        idx !== allItems.length - 1 && "border-b border-dashed border-gray-200"
                      )}
                    >
                      <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing shrink-0" />
                      {item.type === 'pref' ? (
                        <Check className="h-4 w-4 text-[#16a34a] shrink-0" strokeWidth={3} />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 shrink-0" strokeWidth={3} />
                      )}
                      <input
                        className="flex-1 bg-transparent border-none outline-none text-[16px] sm:text-[18px] font-medium leading-snug tracking-tight text-[#1A1A1A] p-0"
                        value={item.label}
                        onChange={(e) => onUpdateRequirement?.(idx, e.target.value)}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              );
            }

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
                      "text-[16px] sm:text-[18px] font-medium leading-snug tracking-tight flex items-center gap-2",
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
              {isPreview ? (
                <input
                  className="text-[16px] sm:text-[18px] font-semibold text-[#d97706] bg-transparent border-none outline-none p-0"
                  value={shortMetadata}
                  onChange={(e) => onEditField?.('condition')}
                />
              ) : (
                <span className="text-[16px] sm:text-[18px] font-semibold text-[#d97706]">{shortMetadata}</span>
              )}
            </div>
          )}
          {budgetDisplay && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Budget</span>
              <div className="flex items-center gap-1.5 text-[16px] sm:text-[18px] font-semibold text-[#d97706]">
                {parsedPrefs.priceLock === "locked" && <LockKeyhole className="h-3.5 w-3.5" />}
                {isPreview ? (
                  <input
                    className="bg-transparent border-none outline-none p-0 text-[#d97706] font-semibold"
                    value={maxBudget}
                    onChange={(e) => onEditField?.('budget')}
                  />
                ) : (
                  maxBudget
                )}
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
      noPadding ? "p-0" : (isFeed ? "p-2" : variant === "detail" ? (smallImages ? (hasContent ? "px-2.5 pt-2.5 pb-0 sm:px-3 sm:pt-3 sm:pb-0" : "px-2 pt-2 pb-0 sm:px-3 sm:pt-3 sm:pb-0") : "p-4 sm:p-5 pb-16") : "p-2.5")
    )}>
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
                    <p className="text-[16px] sm:text-[18px] font-semibold text-[#222234]">{formattedCondition}</p>
                  </div>
                )}
              </div>
            )}

            {(preferences.length > 0 || dealbreakers.length > 0) && (
              <div className="flex flex-col px-5">
                {(() => {
                  const allItems = [
                    ...visiblePreferences.map((p: any) => ({ ...p, type: 'pref', id: p.id })),
                    ...visibleDealbreakers.map((d: any) => ({ ...d, type: 'deal', id: d.id }))
                  ];
                  const displayedItems = (isPreview || showAllRequirements) ? allItems : allItems.slice(0, 5);
                  const remainingCount = (isPreview || showAllRequirements) ? 0 : allItems.length - 5;

                  if (isPreview) {
                    return (
                      <Reorder.Group axis="y" values={allItems} onReorder={(newItems) => onReorderRequirements?.(newItems)} className="flex flex-col">
                        {allItems.map((item, idx) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            className={cn(
                              "flex items-center gap-4 py-4 group/item relative",
                              idx !== allItems.length - 1 && "border-b border-dashed border-gray-200"
                            )}
                          >
                            <GripVertical className="h-4 w-4 text-gray-300 cursor-grab active:cursor-grabbing shrink-0" />
                            {item.type === 'pref' ? (
                              <Check className="h-4 w-4 text-[#16a34a] shrink-0" strokeWidth={3} />
                            ) : (
                              <X className={cn("h-4 w-4 shrink-0 opacity-40", getRequestTheme(request.category).text)} strokeWidth={3} />
                            )}
                            <input
                              className={cn(
                                "flex-1 bg-transparent border-none outline-none text-[16px] sm:text-[18px] font-medium leading-snug tracking-tight p-0",
                                item.type === 'pref' ? "text-[#1A1A1A]" : cn("opacity-40", getRequestTheme(request.category).text)
                              )}
                              value={item.label}
                              onChange={(e) => onUpdateRequirement?.(idx, e.target.value)}
                            />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    );
                  }

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
                            <X className={cn("h-4 w-4 shrink-0 opacity-40", getRequestTheme(request.category).text)} strokeWidth={3} />
                          )}
                          <span className={cn(
                            "text-[16px] sm:text-[18px] font-medium leading-snug tracking-tight",
                            item.type === 'pref' ? "text-[#1A1A1A]" : cn("opacity-40", getRequestTheme(request.category).text)
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
                <div className="flex items-stretch -mx-5 sm:-mx-6">
                  {shortMetadata && (
                    <div className="flex flex-col items-center flex-1 py-4 justify-center min-w-0 px-2">
                      <span className="text-[13px] text-gray-400 font-normal leading-none mb-1.5 text-center">Condition</span>
                      {isPreview ? (
                        <input
                          className="text-[16px] sm:text-[18px] font-semibold text-[#222234] bg-transparent border-none outline-none p-0 text-center w-full"
                          value={shortMetadata}
                          onChange={(e) => onEditField?.('condition')}
                        />
                      ) : (
                        <span className="text-[16px] sm:text-[18px] font-semibold text-[#222234] tracking-tight leading-tight text-center truncate w-full">
                          {shortMetadata}
                        </span>
                      )}
                    </div>
                  )}
                  {(shortMetadata || maxBudget) && (
                    <div className="w-1 bg-[#f7f8f9] shrink-0" />
                  )}
                  <div className="flex flex-col items-center flex-1 py-4 justify-center min-w-0 px-2">
                    <span className="text-[13px] text-gray-400 font-normal leading-none mb-1.5 text-center">Budget</span>
                    {isPreview ? (
                      <input
                        className="text-[18px] sm:text-[20px] font-semibold text-[#222234] bg-transparent border-none outline-none p-0 text-center w-full"
                        value={maxBudget}
                        onChange={(e) => onEditField?.('budget')}
                      />
                    ) : (
                      <span className="text-[18px] sm:text-[20px] font-semibold text-[#222234] tracking-tight leading-tight text-center truncate w-full">
                        {maxBudget}
                      </span>
                    )}
                  </div>
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
      {/* Header Section (Removed from inside white section) */}
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
            <div className="flex flex-col gap-2.5">
              {/* Core Content Area with Themed Background */}
              <div className={cn("p-2 rounded-[22px] flex flex-col gap-2", getRequestTheme(request.category).bg)}>
                {/* Themed Identification Header - Now at the Top */}
                <section className={cn(smallImages && !request.profiles?.username && !request.title && "hidden", "px-1")}>
                  <div className={cn("p-4 rounded-[16px]", getRequestTheme(request.category).bg)}>
                    <div className="flex items-start gap-4">
                      {/* Content - Left side */}
                      <div className="flex-1 min-w-0">
                        <div className="flex-1 min-w-0 relative">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Username hidden as requested */}
                              {/* Title & Category Row */}
                              <div className={cn(smallImages ? "flex items-center justify-between gap-3 mb-2" : "block")}>
                                <h3
                                  className={cn(
                                    "font-semibold leading-snug transition-colors relative group/edit",
                                    getRequestTheme(request.category).text,
                                    variant === "detail" && !smallImages ? "text-4xl" : "text-[18px]",
                                    smallImages && "line-clamp-2 pr-4",
                                    !headerActions && !smallImages && "pr-24",
                                    isPreview && "cursor-pointer hover:bg-black/5 rounded-lg -mx-2 px-2 py-1 transition-all"
                                  )}
                                  style={{
                                    fontFamily: "'Zalando Sans', sans-serif",
                                    ...(variant === "detail" && !smallImages ? { letterSpacing: '-1.2px' } : {})
                                  }}
                                  onClick={() => isPreview && onEditField?.('title')}
                                >
                                  {request.title}
                                  {request.status === "pending" && !isPreview && (
                                    <span className={cn(
                                      "ml-3 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border inline-flex items-center gap-1 align-middle opacity-80",
                                      getRequestTheme(request.category).text,
                                      "bg-white/50 border-current/20"
                                    )}>
                                      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", getRequestTheme(request.category).bg.replace('bg-', 'bg-').replace('/80', ''))} />
                                      Pending Review
                                    </span>
                                  )}
                                  {editedFields.length > 0 && (
                                    <span className="ml-3 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded inline-flex items-center">Edited</span>
                                  )}
                                  {isPreview && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/edit:opacity-100 transition-opacity">
                                      <Pencil className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                </h3>
                                {smallImages && (visibleImages.length > 0 || isPreview) && (
                                  <div 
                                    className={cn(
                                      "relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border transition-all duration-200",
                                      visibleImages.length > 0 ? "bg-gray-50 border-gray-100" : "bg-white/40 border-dashed border-current/20 hover:bg-white/60 cursor-pointer flex items-center justify-center",
                                      visibleImages.length === 0 && getRequestTheme(request.category).text
                                    )}
                                    onClick={() => isPreview && visibleImages.length === 0 && onEditField?.('images')}
                                  >
                                    {visibleImages.length > 0 ? (
                                      <Image
                                        src={visibleImages[0]}
                                        alt={request.title}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                        priority={priority}
                                      />
                                    ) : (
                                      <Plus className="h-5 w-5 opacity-60" />
                                    )}
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
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {isPreview ? (
                  <Card
                    ref={cardRef}
                    className={cn(
                      "flex flex-col relative w-full bg-white shadow-none transition-all duration-300 ease-out",
                      !noRounding && "overflow-hidden rounded-[18px]",
                      noRounding && "rounded-none",
                      noBorder ? "!border-none !shadow-none bg-white font-medium" : "border border-[#e5e7eb]",
                      hasContent ? "h-full" : "h-fit"
                    )}
                  >
                    {cardContent}
                  </Card>
                ) : (
                  <Link
                    href={createRequestUrl(request.slug, searchParams)}
                    prefetch={true}
                    scroll={false}
                    className="flex flex-col h-full group/card"
                  >
                    <Card
                      ref={cardRef}
                      className={cn(
                        "flex flex-col relative w-full bg-white shadow-none transition-all duration-300 ease-out",
                        !noRounding && "overflow-hidden rounded-[18px]",
                        noRounding && "rounded-none",
                        noBorder ? "!border-none !shadow-none bg-white font-medium" : "border border-[#e5e7eb]",
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
                )}
              </div>

              {/* Footer Section - Outside the themed BG wrapper */}
              <div className="px-1">
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

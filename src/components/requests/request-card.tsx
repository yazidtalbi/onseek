"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { memo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/lib/utils/name";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatSubmissionCount } from "@/lib/utils/submissions";
import { formatBudget } from "@/lib/utils/format";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import type { RequestItem } from "@/lib/types";
import Image from "next/image";
import {
  MapPin, Check, X, Sparkles, Laptop, Gamepad2, ShoppingBag, HeartPulse, Baby,
  Home, Shovel, Car, Apple, Package, Watch, Smartphone, Tv, Gem, Headphones,
  Camera, Footprints, LockKeyhole, Wallet, Pencil, GripVertical, Plus,
  Cpu, Battery, Monitor, Leaf, Utensils, Truck, Scissors, Heart, Smile,
  ShieldCheck, Sofa, Lightbulb, Hammer, Trophy, Zap, Users, Gauge, Fuel,
  Key, Activity, Stethoscope, Pill, Plane, Globe, Tent, Box, Eye,
  Keyboard, Book, Wrench, Brush, Code, ChevronRight
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { createRequestUrl } from "@/lib/utils/slug";
import { inferIconName } from "@/lib/utils/icons";
import { getRequestTheme as getRequestThemeUtility } from "@/lib/utils/request-themes";

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



function getRequestIcon(request: RequestItem) {
  const iconName = request.icon || inferIconName(request.title, request.category);

  const iconMap: Record<string, any> = {
    'laptop': Laptop,
    'smartphone': Smartphone,
    'headphones': Headphones,
    'gamepad-2': Gamepad2,
    'camera': Camera,
    'tv': Tv,
    'watch': Watch,
    'footprints': Footprints,
    'shopping-bag': ShoppingBag,
    'car': Car,
    'apple': Apple,
    'sparkles': Sparkles,
    'package': Package,
    'map-pin': MapPin,
    'heart-pulse': HeartPulse,
    'baby': Baby,
    'home': Home,
    'box': Box,
    'keyboard': Keyboard,
    'book': Book,
    'wrench': Wrench,
    'brush': Brush,
    'code': Code
  };

  return iconMap[iconName] || Package;
}

function getTheme(category: string) {
  const c = (category || "").toLowerCase();

  if (c.includes("tech") || c.includes("electronics"))
    return { bg: "bg-blue-50/60", text: "text-blue-900", icon: Laptop };

  if (c.includes("grocery") || c.includes("food"))
    return { bg: "bg-emerald-50/60", text: "text-emerald-900", icon: Apple };

  if (c.includes("fashion") || c.includes("accessory") || c.includes("beauty"))
    return { bg: "bg-purple-50/60", text: "text-purple-900", icon: ShoppingBag };

  if (c.includes("family") || c.includes("kids") || c.includes("baby"))
    return { bg: "bg-pink-50/60", text: "text-pink-900", icon: Baby };

  if (c.includes("home") || c.includes("living") || c.includes("garden"))
    return { bg: "bg-orange-50/60", text: "text-orange-900", icon: Home };

  if (c.includes("gaming") || c.includes("console") || c.includes("entertainment"))
    return { bg: "bg-indigo-50/60", text: "text-indigo-900", icon: Gamepad2 };

  if (c.includes("automotive") || c.includes("car"))
    return { bg: "bg-slate-50/60", text: "text-slate-900", icon: Car };

  if (c.includes("health"))
    return { bg: "bg-cyan-50/60", text: "text-cyan-900", icon: HeartPulse };

  if (c.includes("travel") || c.includes("service"))
    return { bg: "bg-teal-50/60", text: "text-teal-900", icon: MapPin };

  return { bg: "bg-[#f5f6f9]", text: "text-[#1A1A1A]", icon: Package };
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
  request: RequestItem & { profiles?: { username?: string; avatar_url?: string | null; first_name?: string | null; last_name?: string | null } };
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
  hideAuthOverlay?: boolean;
  isLarge?: boolean;
  hideTags?: boolean;
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
  hideAuthOverlay = false,
  isLarge = false,
  hideTags = false,
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
  const maxPreferences = (smallImages && variant !== "detail") ? 3 : preferences.length;
  const maxDealbreakers = (smallImages && variant !== "detail") ? 3 : dealbreakers.length;

  const visibleImages = images.slice(0, maxImages);
  const visiblePreferences = preferences.slice(0, maxPreferences);
  const visibleDealbreakers = dealbreakers.slice(0, maxDealbreakers);
  const remainingPreferences = preferences.length - visiblePreferences.length;
  const remainingDealbreakers = dealbreakers.length - visibleDealbreakers.length;
  const totalRemainingCount = remainingPreferences + remainingDealbreakers;
  const isInline = (preferences.length + dealbreakers.length) <= 2;
  const hasRequirements = visiblePreferences.length > 0 || visibleDealbreakers.length > 0;
  const hasContent = hasRequirements || !!request.description || (variant === "feed" && !!request.matchReason);

  const theme = getTheme(request.category);

  const headerBadges = (
    <div className="flex items-center justify-between w-full">
      {request.category && (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full font-bold border shadow-none shrink-0 inline-flex items-center justify-center bg-transparent gap-2",
            isLarge ? "px-5 py-2 text-[15px] sm:text-[16px]" : "px-4 py-1.5 text-[13px] sm:text-[14px]",
            getTheme(request.category).text, "border-opacity-20"
          )}
        >
          <span className={cn("rounded-full bg-current", isLarge ? "w-2 h-2" : "w-1.5 h-1.5")} />
          <span>{request.category.charAt(0).toUpperCase() + request.category.slice(1)}</span>
        </Badge>
      )}

      <Badge
        variant="outline"
        className={cn(
          "rounded-full font-bold border shadow-none shrink-0 inline-flex items-center gap-2 bg-transparent",
          isLarge ? "px-5 py-2 text-[15px] sm:text-[16px]" : "px-4 py-1.5 text-[13px] sm:text-[14px]",
          request.status === "solved" || request.winner_submission_id ? "border-[#6925DC] text-[#6925DC]" :
            request.status === "pending" ? "border-[#FF8C5A] text-[#FF8C5A]" :
              request.status === "open" ? cn("border-current", getTheme(request.category).text) :
                request.status === "rejected" ? "border-red-400 text-red-500" :
                  "border-gray-500 text-gray-500"
        )}
      >
        <span className="text-[#1A1A1A]">
          {request.winner_submission_id ? "Solved" : request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
        </span>
      </Badge>
    </div>
  );

  const footerSection = (variant === "feed" || smallImages) && !isPreview && (
    <div
      className={cn(
        "flex items-center justify-between gap-3 flex-wrap",
        "pb-1"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-[24px] h-[24px] rounded-full overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-gray-50 text-[10px] font-bold text-gray-400 relative">
          {request.profiles?.avatar_url ? (
            <Image src={request.profiles.avatar_url} alt={request.profiles?.first_name ? `${request.profiles.first_name} ${request.profiles.last_name || ''}` : (request.profiles?.username || 'user')} fill className="object-cover" sizes="24px" />
          ) : (
            (request.profiles?.first_name?.charAt(0) || request.profiles?.username?.charAt(0) || 'U').toUpperCase()
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("font-bold text-[#1A1A1A]", isLarge ? "text-[15px]" : "text-[13px]")}>
            {formatFullName(request.profiles?.first_name, request.profiles?.last_name, request.profiles?.username)}
          </span>
          <span className={cn("text-gray-400", isLarge ? "text-[14px]" : "text-[12px]")}>
            · {timeAgo}
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
    <div className={cn(
      "flex flex-col h-full bg-white border border-gray-100/50 shadow-none relative transition-colors hover:border-gray-200",
      noBorder && "bg-transparent border-none px-0"
    )}>
      <div className="px-4 pt-4 pb-2">
        {headerBadges}
        <div className="mb-5" />

        <div className="flex flex-col gap-2">
          {/* Automated Tags */}

          <div className="flex flex-row items-center gap-3">
            <div className="relative flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isPreview ? (
                  <textarea
                    className={cn(
                      "w-full font-semibold leading-tight tracking-tight bg-transparent border-none outline-none resize-none overflow-hidden p-0",
                      isLarge ? "text-[18px] sm:text-[20px]" : "text-[15px] sm:text-[17px]",
                      getTheme(request.category).text
                    )}
                    style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif", fontWeight: 600, maxWidth: '80%' }}
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
                      "font-semibold leading-normal tracking-tight relative transition-colors items-center text-[#1A1A1A]",
                      isLarge ? "text-[18px] sm:text-[20px]" : "text-[15px] sm:text-[17px]"
                    )}
                    style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif", fontWeight: 600, maxWidth: '80%' }}
                  >
                    {request.title}
                  </h3>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>



      <div className="px-6 flex flex-col flex-1">
        {/* Editorial Requirements List */}
        <div className="flex flex-col">
          {(() => {
            const allItems = [
              ...visiblePreferences.map((p: { label: string }, idx: number) => ({ ...p, type: 'pref', id: `pref-${idx}` })),
              ...visibleDealbreakers.map((d: { label: string }, idx: number) => ({ ...d, type: 'deal', id: `deal-${idx}` }))
            ];
            const displayedItems = allItems;
            const remainingCount = 0;

            if (isPreview) {
              return (
                <Reorder.Group axis="y" values={allItems} onReorder={(newItems) => onReorderRequirements?.(newItems)}>
                  {allItems.map((item, idx) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      className={cn(
                        "flex items-center gap-4 py-2.5 px-4 group/item relative",
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
                      "flex items-center gap-4 py-2.5 px-4 group/item",
                      (idx !== displayedItems.length - 1 || totalRemainingCount > 0) && "border-b border-dashed border-gray-200"
                    )}
                  >
                    {item.type === 'pref' ? (
                      <Check className={cn("text-emerald-500 shrink-0", isLarge ? "h-5 w-5" : "h-4 w-4")} strokeWidth={3} />
                    ) : (
                      <X className={cn("shrink-0", isLarge ? "h-5 w-5" : "h-4 w-4", theme.text, "opacity-30")} strokeWidth={3} />
                    )}
                    <span className={cn(
                      "font-medium leading-snug tracking-tight flex items-center gap-2",
                      isLarge ? "text-[17px] sm:text-[19px]" : "text-[15px] sm:text-[17px]",
                      item.type === 'pref' ? "text-[#1A1A1A]" : cn(theme.text, "opacity-30")
                    )}>
                      {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                    </span>
                  </div>
                ))}
                {totalRemainingCount > 0 && (
                  <div className={cn("py-2.5 px-4 font-medium text-[#7755FF] opacity-80", isLarge ? "text-[18px] sm:text-[20px]" : "text-[16px] sm:text-[18px]")}>
                    And {totalRemainingCount} more {totalRemainingCount === 1 ? 'requirement' : 'requirements'}
                  </div>
                )}
              </>
            );
          })()}

        </div>

        {/* Automated Tags moved below requirements */}
        {request.tags && request.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 mb-1">
            {request.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-black/[0.04] text-gray-500 text-[11px] px-2.5 py-0.5 rounded-full font-medium hover:bg-black/[0.08] hover:text-black transition-all"
              >
                #{tag.name.toLowerCase()}
              </Link>
            ))}
            {request.tags.length > 3 && (
              <span className="text-[10px] text-gray-400 font-bold self-center">
                +{request.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Auth Gating Overlay for Guest Users */}
        {!currentUserId && !isPreview && !hideAuthOverlay && (
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-8 z-[20] rounded-b-[22px] pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/login';
              }}
              className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full font-bold text-[14px] shadow-xl hover:scale-105 transition-transform"
            >
              Sign up to explore
            </button>
          </div>
        )}

        {/* Separator - Full Width */}
        <div className={cn("h-px -mx-5 sm:-mx-6 mt-4", theme.text, "bg-current opacity-20")} />

        {/* Metadata Section - 35/65 Layout for Request and Proposal */}
        <div className={cn(
          "grid grid-cols-[35%_65%] gap-0 pb-6 pt-6",
          theme.text
        )}>
          {/* Left Side (35%): Request Info */}
          <div className={cn("flex flex-col pr-4 border-r border-current border-opacity-20 divide-y divide-current divide-opacity-20 items-start", getTheme(request.category).text)}>
            {shortMetadata && (
              <div className="flex flex-col gap-0 pb-3 items-start">
                <span className={cn("font-semibold text-[#1A1A1A]", isLarge ? "text-[18px] sm:text-[20px]" : "text-[16px] sm:text-[18px]")}>{shortMetadata}</span>
                <span className={cn("font-normal text-black/40", isLarge ? "text-[15px]" : "text-[13px]")}>Condition</span>
              </div>
            )}
            {request.country && (
              <div className={cn("flex flex-col gap-0 items-start", shortMetadata ? "pt-3" : "")}>
                <span className={cn("font-semibold text-[#1A1A1A]", isLarge ? "text-[17px] sm:text-[18px]" : "text-[15px] sm:text-[16px]")}>{request.country}</span>
                <span className={cn("font-normal text-black/40", isLarge ? "text-[15px]" : "text-[13px]")}>Location</span>
              </div>
            )}
          </div>

          {/* Right Side (65%): Proposal Info */}
          <div className="flex flex-col pl-6 items-start">
            {budgetDisplay && (
              <div className="flex flex-col gap-0 items-start">
                <div className={cn("flex items-center gap-1.5 font-semibold text-[#1A1A1A]", isLarge ? "text-[18px] sm:text-[20px]" : "text-[16px] sm:text-[18px]")}>
                  {parsedPrefs.priceLock === "locked" && <LockKeyhole className={cn(isLarge ? "h-5 w-5" : "h-4 w-4")} />}
                  {maxBudget}
                </div>
                <span className={cn("text-[13px] font-normal", theme.text, "opacity-30", isLarge ? "text-[15px]" : "text-[13px]")}>Budget</span>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails Row (if needed, though hero shows it) */}
        {visibleImages.length > 1 && (
          <div className="mt-2 mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {visibleImages.slice(1).map((imgUrl, index) => (
              <div
                key={index}
                className="relative w-12 h-12 flex-shrink-0 bg-gray-50 overflow-hidden border border-gray-100 rounded-lg"
              >
                <Image src={imgUrl} alt={`${request.title} - Image ${index + 2}`} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-300" sizes="48px" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <CardContent className={cn(
      "flex flex-col h-full",
      noPadding ? "p-0" : (isFeed ? "p-2" : variant === "detail" ? (smallImages ? (hasContent ? cn("bg-transparent px-2 pb-0 sm:px-2 sm:pb-0", hasRequirements ? "pt-1 sm:pt-1.5" : "pt-0") : "bg-transparent px-2 pt-1 pb-0 sm:px-2 sm:pt-1.5 sm:pb-0") : "p-4 sm:p-5 pb-16") : "p-2.5")
    )}>
      {/* Main Content Section */}
      <section className={cn("flex flex-col px-4", hasContent && "flex-1")}>
        {/* Empty space adjusted as category badge was removed */}
        {/* Title for detail page */}
        {variant === "detail" && (
          <div className={cn(smallImages ? "mb-4 pt-6" : "mb-8")}>
            <h1
              className={cn(
                "font-semibold leading-[1.3] text-[#1A1A1A]",
                smallImages ? (isLarge ? "text-[26px] sm:text-[28px]" : "text-[22px] sm:text-[24px]") : (isLarge ? "text-[30px] sm:text-[36px]" : "text-[26px] sm:text-[30px]")
              )}
              style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif", fontWeight: 600, letterSpacing: '-0.02em', maxWidth: '80%' }}
            >
              {request.title}
            </h1>
          </div>
        )}



        {/* Preferences and Dealbreakers - feed view is handled in the main if branch */}





        {/* Expanded Details Section - only show on detail variant */}
        {variant === "detail" && (
          <div className={cn("space-y-5", !smallImages && "pt-3")}>
            {/* Budget, Location, and Condition - now redundant on home page previews */}
            {!smallImages && (budgetText || request.country || request.condition) && (
              <div className="flex flex-wrap items-center gap-12 w-full pb-2">
                {request.country && (
                  <div className="flex flex-col gap-0 items-start">
                    <span className="text-[16px] sm:text-[18px] font-semibold text-[#1A1A1A]">{request.country}</span>
                    <span className={cn("text-[13px] font-normal", theme.text, "opacity-30")}>Location</span>
                  </div>
                )}
                {request.condition && (
                  <div className="flex flex-col gap-0 items-start">
                    <span className="text-[16px] sm:text-[18px] font-semibold text-[#1A1A1A]">{formattedCondition}</span>
                    <span className={cn("text-[13px] font-normal", theme.text, "opacity-30")}>Condition</span>
                  </div>
                )}
                {budgetText && (
                  <div className="flex flex-col gap-0 items-start relative">
                    <div className="flex items-center gap-1.5 text-[16px] sm:text-[18px] font-semibold text-[#1A1A1A]">
                      {parsedPrefs.priceLock === "locked" && <LockKeyhole className="h-4 w-4 text-gray-400" />}
                      <span>{budgetText}</span>
                    </div>
                    <span className={cn("text-[13px] font-normal", theme.text, "opacity-30")}>Budget</span>
                  </div>
                )}
              </div>
            )}

            {(preferences.length > 0 || dealbreakers.length > 0) && (
              <div className="flex flex-col">
                {(() => {
                  const allItems = [
                    ...visiblePreferences.map((p: any) => ({ ...p, type: 'pref', id: p.id })),
                    ...visibleDealbreakers.map((d: any) => ({ ...d, type: 'deal', id: d.id }))
                  ];
                  const displayedItems = allItems;
                  const remainingCount = 0;

                  if (isPreview) {
                    return (
                      <Reorder.Group axis="y" values={allItems} onReorder={(newItems) => onReorderRequirements?.(newItems)} className="flex flex-col">
                        {allItems.map((item, idx) => (
                          <Reorder.Item
                            key={item.id}
                            value={item}
                            className={cn(
                              "flex items-center gap-4 py-4 group/item relative",
                              idx !== allItems.length - 1 && cn("border-b border-dashed", getTheme(request.category).text, "border-opacity-10")
                            )}
                          >
                            <GripVertical className={cn("h-4 w-4 cursor-grab active:cursor-grabbing shrink-0", getTheme(request.category).text, "opacity-30")} />
                            {item.type === 'pref' ? (
                              <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                            ) : (
                              <X className="h-4 w-4 text-black/40 shrink-0" strokeWidth={3} />
                            )}
                            <input
                              className={cn(
                                "flex-1 bg-transparent border-none outline-none text-[16px] sm:text-[18px] font-medium leading-snug tracking-tight p-0",
                                item.type === 'pref' ? "text-[#1A1A1A]" : "text-black/40"
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
                    <div className="flex flex-col gap-6">
                      {visiblePreferences.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <h4 className="text-[14px] font-bold text-black/30">Preferences</h4>
                          <div className="flex flex-col">
                            {visiblePreferences.map((item: any, idx) => (
                              <div
                                key={`pref-detail-${idx}`}
                                className={cn(
                                  "flex items-center gap-4 py-4 group/item",
                                  idx !== visiblePreferences.length - 1 && cn("border-b border-dashed", getTheme(request.category).text, "border-opacity-10")
                                )}
                              >
                                <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                                <span className={cn(
                                  "text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]"
                                )}>
                                  {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {visibleDealbreakers.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <h4 className="text-[14px] font-bold text-black/30">Dealbreakers</h4>
                          <div className="flex flex-col">
                            {visibleDealbreakers.map((item: any, idx) => (
                              <div
                                key={`deal-detail-${idx}`}
                                className={cn(
                                  "flex items-center gap-4 py-4 group/item",
                                  idx !== visibleDealbreakers.length - 1 && cn("border-b border-dashed", getTheme(request.category).text, "border-opacity-10")
                                )}
                              >
                                <X className={cn("h-4 w-4 shrink-0", theme.text, "opacity-30")} strokeWidth={3} />
                                <span className={cn(
                                  "text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight",
                                  theme.text, "opacity-30"
                                )}>
                                  {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Automated Tags moved below requirements */}
            {request.tags && request.tags.length > 0 && !hideTags && (
              <div className="flex flex-wrap gap-2 mt-6">
                {request.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-black/[0.05] text-gray-600 text-[13px] px-3.5 py-1 rounded-full font-medium hover:bg-black/[0.1] hover:text-black transition-all"
                  >
                    #{tag.name.toLowerCase()}
                  </Link>
                ))}
              </div>
            )}

            {/* Render condition and budget right under tags for smallImages */}
            {smallImages && (shortMetadata || maxBudget) && (
              <div className={cn(
                hasRequirements ? "mt-5" : "mt-0"
              )}>
                <div className={cn("h-px -mx-5 sm:-mx-6", theme.text, "bg-current opacity-20")} />
                <div className="flex items-stretch -mx-5 sm:-mx-6">
                  {shortMetadata && (
                    <div className="flex flex-col items-start flex-1 py-4 min-w-0 px-6 group/meta">
                      {isPreview ? (
                        <input
                          className="text-[16px] sm:text-[18px] font-bold bg-transparent border-none outline-none p-0 text-left w-full text-[#1A1A1A]"
                          value={shortMetadata}
                          onChange={(e) => onEditField?.('condition')}
                        />
                      ) : (
                        <span className="text-[16px] sm:text-[18px] font-bold text-[#1A1A1A] leading-tight text-left truncate w-full">
                          {shortMetadata}
                        </span>
                      )}
                      <span className={cn("text-[13px] font-normal leading-none mt-1", theme.text, "opacity-30")}>Condition</span>
                    </div>
                  )}
                  {(shortMetadata || maxBudget) && (
                    <div className={cn("w-px shrink-0", getTheme(request.category).text, "bg-current opacity-20")} />
                  )}
                  <div className="flex flex-col items-start flex-1 py-4 min-w-0 px-6">
                    {isPreview ? (
                      <input
                        className="text-[16px] sm:text-[18px] font-bold bg-transparent border-none outline-none p-0 text-left w-full text-[#1A1A1A]"
                        value={maxBudget}
                        onChange={(e) => onEditField?.('budget')}
                      />
                    ) : (
                      <span className="text-[16px] sm:text-[18px] font-bold text-[#1A1A1A] leading-tight text-left truncate w-full">
                        {maxBudget}
                      </span>
                    )}
                    <span className={cn("text-[13px] font-normal leading-none mt-1", theme.text, "opacity-30")}>Budget</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reference Images - Hide on home feed if smallImages is true */}
            {images.length > 0 && !smallImages && (
              <div>
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">Reference images</h4>
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
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">Reference links</h4>
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const cardLink = !isPreview ? createRequestUrl(request.slug || request.id) : null;

  const mainCard = (
    <Card
      ref={cardRef}
      className={cn(
        "flex flex-col relative w-full transition-all duration-300 ease-out shadow-none",
        smallImages ? "bg-transparent border-none" : "bg-white border border-[#e6e7eb]",
        !noRounding && "overflow-hidden rounded-[16px]",
        noRounding && "rounded-none",
        noBorder && "!border-none !shadow-none font-medium",
        hasContent ? "h-full" : "h-fit",
        smallImages && !noBorder && !disableHover && "group-hover/card:scale-[1.01]"
      )}
    >
      {cardContent}
    </Card>
  );

  return (
    <div className="relative group w-full">
      {/* Absolute status badge removed as it is now inline with title */}
      {!isPreview && cardLink ? (
        <>
          {isMobile ? (
            <a
              href={cardLink}
              className="block focus:outline-none"
            >
              {variant === "detail" && smallImages ? (
                <div className={cn("p-1 sm:p-1.5 rounded-[20px] flex flex-col gap-1", getTheme(request.category).bg)}>
                  {mainCard}
                </div>
              ) : (
                <div className="relative">
                  {mainCard}
                </div>
              )}
            </a>
          ) : (
            <Link
              href={cardLink}
              prefetch={true}
              scroll={false}
              className={cn(
                "block focus:outline-none transition-transform duration-300 ease-out",
                !disableHover && "hover:scale-[1.02]"
              )}
            >
              {variant === "detail" && smallImages ? (
                <div className={cn("p-1 sm:p-1.5 rounded-[20px] flex flex-col gap-1", getTheme(request.category).bg)}>
                  {mainCard}
                </div>
              ) : (
                <div className="relative">
                  {mainCard}
                </div>
              )}
            </Link>
          )}
          {variant !== "detail" && (
            <div className="px-3 pt-3 pb-3 mt-auto">
              {footerSection}
            </div>
          )}
        </>
      ) : (
        <div className="relative">
          {mainCard}
          {variant !== "detail" && (
            <div className="px-3 pt-3 pb-3 mt-auto">
              {footerSection}
            </div>
          )}
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

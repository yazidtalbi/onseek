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
  IconMapPin,
  IconCheck,
  IconX,
  IconChevronRight,
  IconSparkles,
  IconHome,
  IconPackage,
  IconUser,
  IconPlus,
  IconTrophy,
  IconSettings,
  IconLock,
  IconGripVertical
} from "@tabler/icons-react";
import {
  Laptop, Gamepad2, ShoppingBag, HeartPulse, Baby,
  Shovel, Car, Apple, Watch, Smartphone, Tv, Gem, Headphones,
  Camera, Footprints, Wallet, Pencil,
  Cpu, Battery, Monitor, Leaf, Utensils, Truck, Scissors, Heart, Smile,
  ShieldCheck, Sofa, Lightbulb, Hammer, Zap, Users, Gauge, Fuel,
  Key, Activity, Stethoscope, Pill, Plane, Globe, Tent, Box, Eye,
  Keyboard, Book, Wrench, Brush, Code
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { cn } from "@/lib/utils";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { Badge } from "@/components/ui/badge";
import { createRequestUrl } from "@/lib/utils/slug";
import { inferIconName } from "@/lib/utils/icons";
import { getRequestTheme as getRequestThemeUtility } from "@/lib/utils/request-themes";
import {
  IconCirclesFilled,
  IconDiceFilled,
  IconClubsFilled,
  IconHanger2Filled,
  IconCookieFilled,
  IconMedicalCrossFilled,
  IconMacroFilled,
  IconFlareFilled,
  IconBabyCarriageFilled,
  IconGlobeFilled,
  IconCardsFilled,
  IconCarFanFilled,
  IconBinocularsFilled
} from "@tabler/icons-react";

function getTablerIcon(category: string) {
  const c = (category || "").toLowerCase();

  if (c.includes("tech") || c.includes("electronics")) return IconCirclesFilled;
  if (c.includes("grocery") || c.includes("food")) return IconCookieFilled;
  if (c.includes("fashion") || c.includes("accessory") || c.includes("beauty")) return IconHanger2Filled;
  if (c.includes("health")) return IconMedicalCrossFilled;
  if (c.includes("family") || c.includes("kids") || c.includes("baby")) return IconBabyCarriageFilled;
  if (c.includes("home") || c.includes("living") || c.includes("garden")) return IconClubsFilled;
  if (c.includes("garden") || c.includes("plants")) return IconMacroFilled;
  if (c.includes("automotive") || c.includes("car")) return IconCarFanFilled;
  if (c.includes("culture") || c.includes("art") || c.includes("trends")) return IconCardsFilled;
  if (c.includes("gaming") || c.includes("console") || c.includes("entertainment")) return IconDiceFilled;
  if (c.includes("travel") || c.includes("logistics")) return IconGlobeFilled;
  if (c.includes("services") || c.includes("professional") || c.includes("labor")) return IconFlareFilled;

  return IconBinocularsFilled;
}

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
    'sparkles': IconSparkles,
    'package': IconPackage,
    'map-pin': IconMapPin,
    'heart-pulse': HeartPulse,
    'baby': Baby,
    'home': IconHome,
    'box': Box,
    'keyboard': Keyboard,
    'book': Book,
    'wrench': Wrench,
    'brush': Brush,
    'code': Code
  };

  return iconMap[iconName] || IconPackage;
}

function getTheme(category: string) {
  const c = (category || "").toLowerCase();

  if (c.includes("tech") || c.includes("electronics"))
    return { bg: "bg-blue-50/60", text: "text-blue-900", border: "border-blue-900", borderLight: "border-blue-300", icon: Laptop };

  if (c.includes("grocery") || c.includes("food"))
    return { bg: "bg-emerald-50/60", text: "text-emerald-900", border: "border-emerald-900", borderLight: "border-emerald-300", icon: Apple };

  if (c.includes("fashion") || c.includes("accessory") || c.includes("beauty"))
    return { bg: "bg-purple-50/60", text: "text-purple-900", border: "border-purple-900", borderLight: "border-purple-300", icon: ShoppingBag };

  if (c.includes("family") || c.includes("kids") || c.includes("baby"))
    return { bg: "bg-pink-50/60", text: "text-pink-900", border: "border-pink-900", borderLight: "border-pink-300", icon: Baby };

  if (c.includes("home") || c.includes("living") || c.includes("garden"))
    return { bg: "bg-orange-50/60", text: "text-orange-900", border: "border-orange-900", borderLight: "border-orange-300", icon: IconHome };

  if (c.includes("gaming") || c.includes("console") || c.includes("entertainment"))
    return { bg: "bg-indigo-50/60", text: "text-indigo-900", border: "border-indigo-900", borderLight: "border-indigo-300", icon: Gamepad2 };

  if (c.includes("automotive") || c.includes("car"))
    return { bg: "bg-slate-50/60", text: "text-slate-900", border: "border-slate-900", borderLight: "border-slate-300", icon: Car };

  if (c.includes("health"))
    return { bg: "bg-cyan-50/60", text: "text-cyan-900", border: "border-cyan-900", borderLight: "border-cyan-300", icon: HeartPulse };

  if (c.includes("travel") || c.includes("service"))
    return { bg: "bg-teal-50/60", text: "text-teal-900", border: "border-teal-900", borderLight: "border-teal-300", icon: IconMapPin };

  return { bg: "bg-[#f5f6f9]", text: "text-[#1A1A1A]", border: "border-[#1A1A1A]", borderLight: "border-gray-200", icon: IconPackage };
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
  isMasonry?: boolean;
  showRaw?: boolean;
  onToggleRaw?: () => void;
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
  isMasonry = false,
  showRaw: showRawProp,
  onToggleRaw,
}: RequestCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const [internalShowRaw, setInternalShowRaw] = useState(false);
  const showRaw = showRawProp ?? internalShowRaw;
  const setShowRaw = onToggleRaw ?? setInternalShowRaw;
  const timeAgo = formatTimeAgo(request.created_at);
  const parsedPrefs = parseRequestPreferences(request.description) || {
    priceLock: "open",
    preferences: [],
    dealbreakers: [],
  };
  const cleanDesc = cleanDescription(request.description);

  const preferences = parsedPrefs.preferences || [];
  const dealbreakers = parsedPrefs.dealbreakers || [];

  const budgetText = formatBudget(request.budget_min, request.budget_max);
  const maxBudget = request.budget_max ? `$${request.budget_max}` : (budgetText || "Negotiable");
  const isFeed = variant === "feed";
  const theme = getTheme(request.category || "");

  const formattedCondition = (() => {
    const noConditionCategories = ["Services", "Finance & Insurance", "Grocery & Food", "Travel", "Mobile & Internet Plans"];
    if (noConditionCategories.includes(request.category || "")) return null;
    const cond = request.condition?.toLowerCase();
    if (cond === "new") return "New";
    if (cond === "used") return "Used";
    if (cond === "either") return "New & Used";
    return request.condition || "Any";
  })();

  const shortMetadata = [formattedCondition].filter(Boolean).join(" - ");

  // Limit display
  const maxPreferences = (isMasonry || smallImages) ? 3 : preferences.length;
  const maxDealbreakers = (isMasonry || smallImages) ? 2 : dealbreakers.length;

  const visiblePreferences = preferences.slice(0, maxPreferences);
  const visibleDealbreakers = dealbreakers.slice(0, maxDealbreakers);
  const totalRemainingCount = (preferences.length + dealbreakers.length) - (visiblePreferences.length + visibleDealbreakers.length);

  const cardContent = isFeed ? (
    <div className={cn(
      "flex flex-col h-full bg-white border border-gray-100/50 shadow-none relative",
      noBorder && "bg-transparent border-none px-0"
    )}>
      {/* Feed View Content */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-col gap-2">
          <div className={cn(isMasonry ? "flex flex-row items-start justify-between gap-6" : "flex flex-row items-center gap-3")}>
            <div className="relative flex-1">
              <h3 className="text-[17px] sm:text-[19px] font-bold text-[#1A1A1A] leading-[1.3] tracking-tight" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>
                {request.title}
              </h3>
            </div>
            {isMasonry && (
              <div className={cn("shrink-0 pt-1", theme.text)}>
                {(() => {
                  const TablerIcon = getTablerIcon(request.category);
                  return <TablerIcon className="h-7 w-7" fill="currentColor" />;
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1A1A1A] text-[16px]">{shortMetadata || "Any Condition"}</span>
            <span className="text-gray-300">·</span>
            <span className="font-semibold text-[#1A1A1A] text-[16px]">{maxBudget}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[12px] text-gray-400">Requested {timeAgo}</span>
            <div className="flex items-center gap-1.5">
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
          </div>
        </div>
      </div>
    </div>
  ) : (
    /* Workstation Detail Variant */    <div className={cn("p-0 rounded-[20px] flex flex-col gap-1 h-full", theme.bg)}>
      <div className="border border-[#e5e7eb] text-card-foreground flex flex-col relative w-full transition-all duration-300 ease-out shadow-none bg-transparent border-none overflow-hidden rounded-[16px] !border-none !shadow-none font-medium h-full">
        <div className="flex flex-col h-full bg-transparent px-2 pb-0 sm:px-2 sm:pb-0 pt-1 sm:pt-1.5">
          <section className="flex flex-col px-4 flex-1 h-full">
            <div className="flex-1">
              <div className="relative min-h-[300px]">
                {/* PERSISTENT CATEGORY ICON */}
                <div className={cn("absolute top-6 right-0 shrink-0 z-10", theme.text)}>
                  {(() => {
                    const TablerIcon = getTablerIcon(request.category);
                    return <TablerIcon className="h-8 w-8" fill="currentColor" />;
                  })()}
                </div>

                <motion.div
                  initial={false}
                  animate={{ opacity: showRaw ? 0 : 1, y: showRaw ? -10 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={cn(showRaw && "pointer-events-none invisible absolute inset-0")}
                >
                  <div className="mb-4 pt-6 flex flex-row items-start justify-between gap-8">
                    <h1 className="font-semibold text-[#1A1A1A] text-[20px] sm:text-[22px] flex-1 pr-12" style={{ fontFamily: '"Zalando Sans SemiExpanded", sans-serif', fontWeight: 600, maxWidth: '100%' }}>
                      {request.title}
                    </h1>
                  </div>

                  <div className="space-y-5">
                    <div className="flex flex-col">
                      <div className="flex flex-col gap-0">
                        {visiblePreferences.map((item: any, idx: number) => {
                          const isLast = idx === visiblePreferences.length - 1 && visibleDealbreakers.length === 0 && totalRemainingCount === 0;
                          return (
                            <div key={`pref-${idx}`} className={cn(
                              "flex items-center gap-4 py-4 group/item border-current",
                              !isLast && "border-b border-dashed",
                              theme.text
                            )}>
                              <IconCheck className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                              <span className="text-[15px] sm:text-[17px] font-medium leading-snug text-[#1A1A1A]">
                                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                              </span>
                            </div>
                          );
                        })}
                        {visibleDealbreakers.map((item: any, idx: number) => {
                          const isLast = idx === visibleDealbreakers.length - 1 && totalRemainingCount === 0;
                          return (
                            <div key={`db-${idx}`} className={cn(
                              "flex items-center gap-4 py-4 group/item border-current",
                              !isLast && "border-b border-dashed",
                              theme.text
                            )}>
                              <IconX className={cn("h-4 w-4 shrink-0 opacity-30", theme.text)} strokeWidth={3} />
                              <span className={cn(
                                "text-[15px] sm:text-[17px] font-medium leading-snug opacity-30",
                                theme.text
                              )}>
                                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                              </span>
                            </div>
                          );
                        })}
                        {totalRemainingCount > 0 && (
                          <div className={cn("py-4 text-[15px] sm:text-[17px] font-medium opacity-30", theme.text)}>
                            And {totalRemainingCount} more details
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: showRaw ? 1 : 0, y: showRaw ? 0 : 10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className={cn("pt-20 pb-8", !showRaw && "pointer-events-none invisible absolute inset-0")}
                >
                  <p className="text-[17px] sm:text-[19px] font-serif italic text-[#1A1A1A]/80 leading-relaxed tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                    &ldquo;{cleanDesc}&rdquo;
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="mt-5 pb-0">
              <div className={cn("h-px -mx-5 sm:-mx-6 bg-current opacity-20", theme.text)}></div>
              <div className="flex items-stretch -mx-5 sm:-mx-6">
                <div className="flex flex-col items-start flex-1 py-4 min-w-0 px-6 group/meta">
                  <span className="text-[16px] sm:text-[18px] font-bold text-[#1A1A1A] leading-tight text-left truncate w-full">
                    {formattedCondition || "Any"}
                  </span>
                  <span className={cn("text-[13px] font-normal leading-none mt-1 opacity-30", theme.text)}>
                    Condition
                  </span>
                </div>
                <div className={cn("w-px shrink-0 bg-current opacity-20", theme.text)}></div>
                <div className="flex flex-col items-start flex-1 py-4 min-w-0 px-6">
                  <span className="text-[16px] sm:text-[18px] font-bold text-[#1A1A1A] leading-tight text-left truncate w-full">
                    {maxBudget}
                  </span>
                  <span className={cn("text-[13px] font-normal leading-none mt-1 opacity-30", theme.text)}>
                    Budget
                  </span>
                </div>
              </div>
            </div>

          </section>

        </div>
      </div>
    </div>
  );

  const cardLink = !isPreview ? createRequestUrl(request) : null;

  const mainCard = (
    <Card
      ref={cardRef}
      className={cn(
        "flex flex-col relative w-full transition-all duration-300 ease-out shadow-none h-full",
        isFeed ? "bg-white border border-[#e6e7eb] overflow-hidden rounded-[16px]" : "bg-transparent border-none rounded-none"
      )}
    >
      {cardContent}
    </Card>
  );

  return (
    <div className="relative group w-full h-full flex flex-col">
      {!isPreview && cardLink ? (
        <Link
          href={cardLink}
          prefetch={true}
          className={cn(
            "block focus:outline-none transition-transform duration-300 ease-out h-full flex flex-col",
            !disableHover && "hover:scale-[1.02]"
          )}
        >
          {mainCard}
        </Link>
      ) : (
        <div className="relative h-full flex flex-col">
          {mainCard}
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

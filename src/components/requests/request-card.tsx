"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { memo, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatBudget } from "@/lib/utils/format";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import type { RequestItem } from "@/lib/types";
import {
  IconMapPin,
  IconCheck,
  IconX,
  IconSparkles,
  IconHome,
  IconPackage
} from "@tabler/icons-react";
import {
  Laptop, Gamepad2, ShoppingBag, HeartPulse, Baby,
  Car, Apple
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";

const SubmissionForm = dynamic(() => import("@/components/submissions/submission-form").then(mod => mod.SubmissionForm), {
  ssr: false,
});
import { createRequestUrl } from "@/lib/utils/slug";
import { inferIconName } from "@/lib/utils/icons";
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

function getTheme(category: string) {
  const c = (category || "").toLowerCase();

  if (c.includes("tech") || c.includes("electronics"))
    return { bg: "bg-[#F0F7FF]", text: "text-blue-900", border: "border-blue-900", ring: "ring-blue-900", borderLight: "border-blue-300", icon: Laptop };

  if (c.includes("grocery") || c.includes("food"))
    return { bg: "bg-[#ECFDF5]", text: "text-emerald-900", border: "border-emerald-900", ring: "ring-emerald-900", borderLight: "border-emerald-300", icon: Apple };

  if (c.includes("fashion") || c.includes("accessory") || c.includes("beauty"))
    return { bg: "bg-[#F5F3FF]", text: "text-purple-900", border: "border-purple-900", ring: "ring-purple-900", borderLight: "border-purple-300", icon: ShoppingBag };

  if (c.includes("family") || c.includes("kids") || c.includes("baby"))
    return { bg: "bg-[#FFF1F2]", text: "text-pink-900", border: "border-pink-900", ring: "ring-pink-900", borderLight: "border-pink-300", icon: Baby };

  if (c.includes("home") || c.includes("living") || c.includes("garden"))
    return { bg: "bg-[#FFF7ED]", text: "text-orange-900", border: "border-orange-900", ring: "ring-orange-900", borderLight: "border-orange-300", icon: IconHome };

  if (c.includes("gaming") || c.includes("console") || c.includes("entertainment"))
    return { bg: "bg-[#EEF2FF]", text: "text-indigo-900", border: "border-indigo-900", ring: "ring-indigo-900", borderLight: "border-indigo-300", icon: Gamepad2 };

  if (c.includes("automotive") || c.includes("car"))
    return { bg: "bg-[#F8FAFC]", text: "text-slate-900", border: "border-slate-900", ring: "ring-slate-900", borderLight: "border-slate-300", icon: Car };

  if (c.includes("health"))
    return { bg: "bg-[#ECFEFF]", text: "text-cyan-900", border: "border-cyan-900", ring: "ring-cyan-900", borderLight: "border-cyan-300", icon: HeartPulse };

  if (c.includes("travel") || c.includes("service"))
    return { bg: "bg-[#F0FDFA]", text: "text-teal-900", border: "border-teal-900", ring: "ring-teal-900", borderLight: "border-teal-300", icon: IconMapPin };

  return { bg: "bg-[#f5f6f9]", text: "text-[#1A1A1A]", border: "border-[#1A1A1A]", ring: "ring-[#1A1A1A]", borderLight: "border-gray-200", icon: IconPackage };
}

interface RequestCardProps {
  request: RequestItem & { profiles?: { username?: string; avatar_url?: string | null; first_name?: string | null; last_name?: string | null } };
  variant?: "feed" | "detail";
  isFavorite?: boolean;
  images?: string[];
  links?: string[];
  currentUserId?: string | null;
  proposalCount?: number;
  smallImages?: boolean;
  isMasonry?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  priority?: boolean;
  hideAuthOverlay?: boolean;
  isLarge?: boolean;
  hideTags?: boolean;
  showAllRequirements?: boolean;
  isPreview?: boolean;
  noBorder?: boolean;
  disableHover?: boolean;
  isAdmin?: boolean;
  showRaw?: boolean;
  onToggleRaw?: () => void;
}

function RequestCardComponent({
  request,
  variant = "feed",
  isFavorite,
  images = [],
  links = [],
  currentUserId,
  proposalCount,
  smallImages = false,
  isMasonry = false,
  isFirst = false,
  isLast = false,
  priority = false,
  hideAuthOverlay = false,
  isLarge = false,
  hideTags = false,
  showAllRequirements = false,
  isPreview = false,
  noBorder = false,
  disableHover = false,
  isAdmin = false,
  showRaw: showRawProp,
  onToggleRaw,
}: RequestCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [internalShowRaw, setInternalShowRaw] = useState(false);
  const showRaw = showRawProp ?? internalShowRaw;
  const timeAgo = formatTimeAgo(request.created_at);
  const rawPrefs = parseRequestPreferences(request.description) || {};
  const preferences = [...(rawPrefs.preferences || [])];
  const dealbreakers = [...(rawPrefs.dealbreakers || [])];

  // Add advanced flags as preferences if they are set
  if (rawPrefs.exactItem) preferences.unshift({ label: "Exact match only" });
  if (rawPrefs.exactSpecification) preferences.unshift({ label: "Strict requirements" });
  if (rawPrefs.exactPrice) preferences.unshift({ label: "Exact price only" });
  if (rawPrefs.priceLock === "locked") preferences.unshift({ label: "Budget is locked" });

  const cleanDesc = cleanDescription(request.description);

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

  const totalCriteria = preferences.length + dealbreakers.length;
  const visibleLimit = showAllRequirements ? 1000 : 3;
  const hasMore = totalCriteria > visibleLimit;

  // Split preferences and dealbreakers for visible/hidden logic
  const visiblePrefs = preferences.slice(0, visibleLimit);
  const remainingPrefs = preferences.slice(visibleLimit);

  const dbLimit = Math.max(0, visibleLimit - preferences.length);
  const visibleDBs = dealbreakers.slice(0, dbLimit);
  const remainingDBs = dealbreakers.slice(dbLimit);

  const renderCriterion = (item: any, isDealbreaker: boolean, showSeparator = true) => (
    <div key={`${isDealbreaker ? "db" : "pref"}-${item.label}`} className={cn(
      "flex items-center gap-4 py-2.5 border-current border-dashed",
      showSeparator && "border-b",
      theme.text
    )}>
      {isDealbreaker ? (
        <IconX className={cn("h-4 w-4 shrink-0 opacity-30", theme.text)} strokeWidth={3} />
      ) : (
        <IconCheck className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
      )}
      <span className={cn(
        "font-medium leading-snug text-[15px] sm:text-[17px]",
        isDealbreaker ? cn("opacity-30", theme.text) : "text-[#1A1A1A]"
      )}>
        {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
      </span>
    </div>
  );

  const cardFooter = (
    <div className="mt-5 pb-0">
      <div className={cn("h-px -mx-5 sm:-mx-6 bg-current opacity-20", theme.text)}></div>
      <div className="flex items-stretch -mx-5 sm:-mx-6">
        <div className={cn("flex flex-col items-start flex-1 py-4 min-w-0 px-6 group/meta")}>
          <span className={cn("font-bold text-[#1A1A1A] leading-tight text-left truncate w-full text-[16px] sm:text-[18px]")}>
            {formattedCondition || "Any"}
          </span>
          <span className={cn("text-[13px] font-normal leading-none mt-1 opacity-30", theme.text)}>Condition</span>
        </div>
        <div className={cn("w-px shrink-0 bg-current opacity-20", theme.text)}></div>
        <div className={cn("flex flex-col items-start flex-1 py-4 min-w-0 px-6")}>
          <span className={cn("font-bold text-[#1A1A1A] leading-tight text-left truncate w-full text-[16px] sm:text-[18px]")}>
            {maxBudget}
          </span>
          <span className={cn("text-[13px] font-normal leading-none mt-1 opacity-30", theme.text)}>Budget</span>
        </div>
      </div>
    </div>
  );

  const renderMetadata = (isPlaceholder = false) => (
    <div className={cn(
      "flex items-center justify-between w-full mt-2.5 px-1",
      isPlaceholder && "invisible"
    )}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
          {request.profiles?.avatar_url ? (
            <img src={request.profiles.avatar_url} alt={request.profiles.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-gray-400">
              {(request.profiles?.username || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-[#1A1A1A] leading-none">
              {request.profiles?.username || "Account"}
            </span>
            <span className="text-[11px] text-gray-400 font-medium leading-none">
              · {timeAgo}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
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
    </div>
  );

  const quickProposalAction = (
    <div className="mt-2 pb-6 hidden group-hover:block px-4">
      <div className={cn("h-px -mx-9 bg-current opacity-20 mb-4", theme.text)}></div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsProposalOpen(true);
        }}
        className="w-full bg-[#7755FF] hover:bg-[#6644EE] text-white py-4 font-bold text-sm transition-[background-color,transform] flex items-center justify-center gap-2 rounded-full shadow-none hover:scale-[1.02] active:scale-95"
      >
        <IconSparkles className="h-5 w-5" />
        Quick Proposal
      </button>
    </div>
  );

  const renderCardBody = (expanded: boolean) => {
    if (isFeed) {
      return (
        <div className={cn(
          "flex flex-col h-full bg-white relative overflow-hidden",
          noBorder ? "bg-transparent border-none px-0" : "border border-[#e6e7eb] rounded-[16px]"
        )}>
          <div className="flex flex-col h-full px-2 pt-1.5 sm:pt-2">
            <section className="flex flex-col px-4 flex-1 h-full">
              <div className="flex-1 pt-4">
                <div className="flex flex-col gap-3">
                  <div className={cn("shrink-0", theme.text)}>
                    {(() => {
                      const TablerIcon = getTablerIcon(request.category);
                      return <TablerIcon className="h-6 w-6" fill="currentColor" />;
                    })()}
                  </div>
                  <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1A1A1A] leading-[1.2] tracking-tight" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>
                    {request.title}
                  </h3>
                </div>

                <div className="mt-4 flex flex-col gap-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1A1A1A] text-[15px]">{shortMetadata || "Any Condition"}</span>
                    <span className="text-gray-300">·</span>
                    <span className="font-semibold text-[#1A1A1A] text-[15px]">{maxBudget}</span>
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
            </section>
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "flex-1 flex flex-col relative w-full",
        (isMasonry && expanded) || showAllRequirements ? "h-auto" : "h-full",
        !showAllRequirements && "overflow-hidden"
      )}>
        <motion.div
          initial={false}
          animate={{
            rotateY: showRaw ? 180 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          style={{
            transformStyle: "preserve-3d"
          }}
          className={cn(
            "flex-1 relative w-full rounded-[20px] shadow-none border-none",
            (isMasonry && expanded) || showAllRequirements ? "h-auto" : "h-full"
          )}
        >
          {/* FRONT FACE: Entire Card (Criteria) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "translateZ(1px)"
            }}
            className={cn(
              "relative w-full h-full flex flex-col p-0 rounded-[20px] shadow-none border-none transition-[background-color] duration-300",
              (isMasonry && expanded) || showAllRequirements ? "h-auto overflow-visible" : "h-full overflow-hidden",
              theme.bg
            )}
          >
            <div className={cn(
              "flex flex-col bg-transparent px-2 pb-0 sm:px-2 sm:pb-0 pt-1 sm:pt-1.5",
              isMasonry && expanded ? "h-full group-hover:h-auto" : "h-full"
            )}>
              <section className={cn(
                "flex flex-col px-4 flex-1",
                (isMasonry && expanded) || showAllRequirements ? "h-auto" : "h-full"
              )}>
                <div className="flex-1">
                    <div className="mb-4 pt-6 flex flex-col gap-5">
                      {currentUserId === request.user_id && (
                        <div className="w-fit">
                          <span className="bg-[#2563eb] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                            Your request
                          </span>
                        </div>
                      )}
                      
                      <div className="flex flex-row items-start justify-between gap-6">
                        <h1 className={cn(
                          "font-semibold text-[#1A1A1A] flex-1 text-[22px] sm:text-[22px] leading-[1.2]"
                        )} style={{ fontFamily: '"Zalando Sans SemiExpanded", sans-serif', fontWeight: 600 }}>
                          {request.title}
                        </h1>
                        <div className={cn("shrink-0", theme.text)}>
                          {(() => {
                            const TablerIcon = getTablerIcon(request.category);
                            return <TablerIcon className="h-7 w-7" fill="currentColor" />;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Content - Static List */}
                    <div className="flex-1">
                      <div className="space-y-0 flex flex-col relative">
                        <div className="flex flex-col gap-0">
                          {visiblePrefs.map((item: any, idx: number) => {
                            const isLast = !hasMore && visibleDBs.length === 0 && idx === visiblePrefs.length - 1;
                            return renderCriterion(item, false, !isLast);
                          })}
                          {visibleDBs.map((item: any, idx: number) => {
                            const isLast = !hasMore && idx === visibleDBs.length - 1;
                            return renderCriterion(item, true, !isLast);
                          })}

                          {hasMore ? (
                            <div className="relative">
                              {/* Normal View: "And X more" + Footer */}
                              <div className={cn(
                                "transition-[opacity,transform] duration-200",
                                expanded && isMasonry && "group-hover:hidden"
                              )}>
                                <div className={cn(
                                  "py-2.5 font-medium opacity-30 text-[15px] sm:text-[17px]",
                                  theme.text
                                )}>
                                  And {totalCriteria - visibleLimit} more details
                                </div>
                                {cardFooter}
                              </div>

                              {/* Hover View: Ghost Expansion (In-flow within the absolute container) */}
                              {expanded && isMasonry && (
                                <div className="hidden group-hover:block">
                                  <div className={cn(
                                    "border-t border-dashed border-current/10",
                                    theme.bg
                                  )}>
                                    {remainingPrefs.map((item: any, idx: number) => {
                                      const isLast = remainingDBs.length === 0 && idx === remainingPrefs.length - 1;
                                      return renderCriterion(item, false, !isLast);
                                    })}
                                    {remainingDBs.map((item: any, idx: number) => {
                                      const isLast = idx === remainingDBs.length - 1;
                                      return renderCriterion(item, true, !isLast);
                                    })}
                                    {cardFooter}
                                    {/* {quickProposalAction} */}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {cardFooter}
                              {/* {isMasonry && expanded && quickProposalAction} */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

          {/* BACK FACE: Entire Card (Brief) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)"
            }}
            className={cn(
              "absolute inset-0 w-full h-full flex flex-col p-0 rounded-[20px] overflow-hidden shadow-none border-none",
              theme.bg
            )}
          >
            <div className="flex-1 flex flex-col justify-center px-10 py-12 overflow-hidden">
              <div className="flex flex-col gap-4">
                <span className="text-[40px] font-serif text-black/20 leading-none -ml-1">&ldquo;</span>
                <p className="font-serif text-black leading-relaxed tracking-tight text-left text-[20px] sm:text-[22px]">
                  {cleanDesc}
                </p>
                <span className="text-[40px] font-serif text-black/20 leading-none self-end -mr-1">&rdquo;</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const cardLink = !isPreview ? createRequestUrl(request) : null;

  const renderFullCard = (expanded: boolean) => {
    const card = (
      <Card
        ref={expanded ? cardRef : null}
        className={cn(
          "flex flex-col relative w-full transition-[transform,box-shadow,border-color] duration-300 ease-out shadow-none bg-transparent border-none rounded-[20px]",
          isMasonry && expanded ? "h-full group-hover:h-auto overflow-visible group-hover:z-[100] group-hover:border-[10px] group-hover:border-white group-hover:border-b-[18px] group-hover:border-b-[#7755FF]" : "h-full overflow-hidden"
        )}
      >
        {renderCardBody(expanded)}
      </Card>
    );

    if (!isPreview && cardLink) {
      return (
        <Link
          href={cardLink}
          prefetch={true}
          className={cn(
            "focus:outline-none flex flex-col w-full",
            isMasonry && expanded ? "h-full group-hover:h-auto" : "h-full"
          )}
        >
          {card}
        </Link>
      );
    }
    return (
      <div className={cn(
        "relative w-full",
        isMasonry && expanded ? "h-full group-hover:h-auto" : "h-full"
      )}>
        {card}
      </div>
    );
  };

  return (
    <div className="relative w-full z-10 hover:z-50 transition-[z-index] duration-300">
      {/* Placeholder to maintain masonry layout stability */}
      {isMasonry && (
        <div className="invisible pointer-events-none" aria-hidden="true">
          {renderFullCard(false)}
        </div>
      )}

      {/* The actual interactive card */}
      <div className={cn(
        "w-full transition-[transform,box-shadow] duration-300 ease-out group will-change-transform",
        isMasonry ? "absolute top-0 left-0 h-auto z-10 group-hover:z-[100] group-hover:scale-[1.03] group-hover:shadow-2xl" : "h-full"
      )}>
        {renderFullCard(true)}

        {isMasonry && !disableHover && isProposalOpen && (
          <SubmissionForm
            requestId={request.id}
            requestBudgetMax={request.budget_max}
            requestDescription={cleanDesc}
            requestPreferences={rawPrefs.preferences}
            requestDealbreakers={rawPrefs.dealbreakers}
            hideButton={true}
            open={isProposalOpen}
            onOpenChange={setIsProposalOpen}
          />
        )}
      </div>

      {/* Metadata Section - Visible beneath the card */}
      {isMasonry && renderMetadata()}

      {previewImage && (
        <ImagePreviewDialog
          images={images}
          currentIndex={previewImageIndex}
          alt={request.title}
          open={!!previewImage}
          onOpenChange={(open) => {
            if (!open) setPreviewImage(null);
          }}
        />
      )}
    </div>
  );
}

export const RequestCard = memo(RequestCardComponent);

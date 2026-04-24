"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Submission } from "@/lib/types";
import { VoteButtons } from "@/components/submissions/vote-buttons";
import { WinnerButton } from "@/components/submissions/winner-button";
import { ReportDialog } from "@/components/reports/report-dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Link as LinkIcon,
  MessageCircle,
  Sparkles as IconSparkles,
  Laptop,
  Gamepad2,
  Briefcase,
  Plane,
  Home as HomeIcon,
  Sparkles,
  Car,
  Check,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatFullName } from "@/lib/utils/name";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import { ContactInfoDialog } from "@/components/submissions/contact-info-dialog";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/layout/auth-provider";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { createRequestUrl } from "@/lib/utils/slug";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { MessageProposerDialog } from "@/components/messaging/message-proposer-dialog";
import {
  IconCheck,
  IconChevronRight,
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
import {
  ShoppingBag,
  Apple,
  Baby,
  HeartPulse
} from "lucide-react";

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

function getTheme(category: string) {
  const c = (category || "").toLowerCase();

  if (c.includes("tech") || c.includes("electronics"))
    return { bg: "bg-blue-50/60", text: "text-blue-900", border: "border-blue-900", borderLight: "border-blue-300" };

  if (c.includes("grocery") || c.includes("food"))
    return { bg: "bg-emerald-50/60", text: "text-emerald-900", border: "border-emerald-900", borderLight: "border-emerald-300" };

  if (c.includes("fashion") || c.includes("accessory") || c.includes("beauty"))
    return { bg: "bg-purple-50/60", text: "text-purple-900", border: "border-purple-900", borderLight: "border-purple-300" };

  if (c.includes("family") || c.includes("kids") || c.includes("baby"))
    return { bg: "bg-pink-50/60", text: "text-pink-900", border: "border-pink-900", borderLight: "border-pink-300" };

  if (c.includes("home") || c.includes("living") || c.includes("garden"))
    return { bg: "bg-orange-50/60", text: "text-orange-900", border: "border-orange-900", borderLight: "border-orange-300" };

  if (c.includes("gaming") || c.includes("console") || c.includes("entertainment"))
    return { bg: "bg-indigo-50/60", text: "text-indigo-900", border: "border-indigo-900", borderLight: "border-indigo-300" };

  if (c.includes("automotive") || c.includes("car"))
    return { bg: "bg-slate-50/60", text: "text-slate-900", border: "border-slate-900", borderLight: "border-slate-300" };

  if (c.includes("health"))
    return { bg: "bg-cyan-50/60", text: "text-cyan-900", border: "border-cyan-900", borderLight: "border-cyan-300" };

  if (c.includes("travel") || c.includes("service"))
    return { bg: "bg-teal-50/60", text: "text-teal-900", border: "border-teal-900", borderLight: "border-teal-300" };

  return { bg: "bg-[#f5f6f9]", text: "text-[#1A1A1A]", border: "border-[#1A1A1A]", borderLight: "border-gray-200" };
}

function getHost(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

const LogoSVG = ({ className }: { className?: string }) => (
  <svg width="202" height="203" viewBox="0 0 202 203" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M89.6903 22.7515C101.076 22.7563 112.238 24.926 122.626 29.0308L98.3797 53.2769C95.5141 52.856 92.6103 52.6421 89.6903 52.6421C73.8365 52.6621 58.6379 58.9689 47.4276 70.1792C36.2173 81.3895 29.9104 96.5882 29.8904 112.442C29.8905 124.269 33.3977 135.831 39.9686 145.665C46.5395 155.499 55.8785 163.164 66.8055 167.69C77.7324 172.216 89.7563 173.4 101.356 171.092C112.956 168.785 123.612 163.089 131.975 154.726C140.338 146.363 146.033 135.708 148.341 124.108C149.513 118.214 149.782 112.211 149.171 106.297L173.889 81.5786C177.482 91.3728 179.376 101.809 179.381 112.442C179.381 130.181 174.12 147.522 164.264 162.271C154.409 177.02 140.402 188.516 124.013 195.304C107.625 202.093 89.5904 203.869 72.1922 200.409C54.7941 196.948 38.8127 188.405 26.2694 175.862C13.7261 163.318 5.18415 147.337 1.72346 129.939C-1.73716 112.541 0.038578 94.5073 6.82697 78.1187C13.6154 61.7299 25.1117 47.722 39.8612 37.8667C54.6106 28.0115 71.9513 22.7515 89.6903 22.7515ZM138.41 37.1548C143.671 40.5602 148.6 44.5321 153.099 49.0317C155.366 51.2985 157.498 53.6758 159.492 56.1479L159.311 56.3296L159.304 56.3228L138.179 77.4468C134.843 72.8249 130.854 68.6901 126.323 65.1782L147.126 44.3765L138.41 37.1548Z" fill="currentColor"/>
    <path d="M89.6924 137.599C103.586 137.599 114.85 126.336 114.85 112.442C114.85 98.5482 103.586 87.2849 89.6924 87.2849C75.7984 87.2849 64.5352 98.5482 64.5352 112.442C64.5352 126.336 75.7984 137.599 89.6924 137.599Z" fill="currentColor"/>
    <path d="M164.933 1.11172L171.519 31.1458L201.522 37.701L168.319 70.904L149.799 66.8899L137.01 79.6786L136.801 79.5108L136.999 79.68L96.9381 119.741L82.8844 105.687L121.864 66.7076L121.869 66.7118L135.745 52.8362L131.73 34.3147L164.933 1.11172Z" fill="currentColor"/>
  </svg>
);

export function SubmissionCard({
  submission,
  requestId,
  requestTitle,
  isWinner,
  canSelectWinner,
  onWinnerSelected,
  disableWinnerAction,
  isFirst = false,
  isLast = false,
  isOnlyOne = false,
  hideVotes = false,
  requestOwnerId,
  hideTitle,
  largeText,
  noBorder = false,
  isBest = false,
  requestPreferences = [],
  requestDealbreakers = [],
  viewMode = "expanded",
}: {
  submission: Submission;
  requestId: string;
  requestTitle?: string;
  isWinner?: boolean;
  canSelectWinner?: boolean;
  onWinnerSelected?: (submissionId: string) => void;
  disableWinnerAction?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isOnlyOne?: boolean;
  hideVotes?: boolean;
  requestOwnerId?: string;
  hideTitle?: boolean;
  largeText?: boolean;
  noBorder?: boolean;
  isBest?: boolean;
  requestPreferences?: any[];
  requestDealbreakers?: any[];
  viewMode?: "expanded" | "compact";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [submitterProfile, setSubmitterProfile] = React.useState<any>(null);
  const [messageDialogOpen, setMessageDialogOpen] = React.useState(false);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);

  const isRequestOwner = user?.id === requestOwnerId;

  const host = React.useMemo(() => {
    if (!submission.url || submission.url === "personal-item") return null;
    try {
      return new URL(submission.url).hostname.replace("www.", "");
    } catch {
      return null;
    }
  }, [submission.url]);

  React.useEffect(() => {
    if (!submission.url || submission.url === "personal-item" || submission.image_url) {
      return;
    }

    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(submission.url)}`);
        const data = await response.json();
        if (data.imageUrl) {
          setThumbnailUrl(data.imageUrl);
        }
      } catch (err) {
        console.error("Error fetching link preview:", err);
      }
    };

    fetchPreview();
  }, [submission.url, submission.image_url]);

  const isPersonalItem = submission.url === "personal-item";
  const imageUrl = submission.image_url || thumbnailUrl;
  const hasImage = imageUrl && !imageError;
  const storeName = submission.article_name || (submission as any).articleName || (submission as any).title || (submission as any).store_name || host || "Submission";
  const rawNotes = submission.notes || (submission as any).description || (submission as any).content || "";
  const description = rawNotes ? rawNotes.replace(/^\[Personal Item\]\s*/i, "") : "";
  const domain = isPersonalItem ? "Listing" : host;
  const profile = (submission as any).profiles;
  const username = profile?.username;
  const fullName = formatFullName(profile?.first_name, profile?.last_name, username);

  const handleCardClick = () => {
    if (isPersonalItem && hasImage) {
      setContactDialogOpen(true);
    } else if (!isPersonalItem && submission.url) {
      window.open(submission.url, "_blank", "noopener,noreferrer");
    }
  };

  const matchedRequirements = React.useMemo(() => {
    if (!description) return [];
    const allCriteria = [
      ...(requestPreferences || []),
      ...(requestDealbreakers || [])
    ];
    if (allCriteria.length === 0) return [];

    return allCriteria
      .map(item => typeof item === 'string' ? item : item.label)
      .filter(label => {
        if (!label) return false;
        const lowerLabel = label.toLowerCase();
        return (
          description.toLowerCase().includes(lowerLabel) ||
          storeName.toLowerCase().includes(lowerLabel)
        );
      });
  }, [requestPreferences, requestDealbreakers, description, storeName]);

  const totalCriteria = (requestPreferences?.length || 0) + (requestDealbreakers?.length || 0);
  const theme = getTheme(submission.category || "");
  const TablerIcon = getTablerIcon(submission.category || "");

  if (viewMode === "compact") {
    return (
      <div className={cn(
        "rounded-2xl border-none flex flex-col h-full overflow-hidden transition-all",
        theme.bg,
        isBest && "ring-2 ring-[#ff4f27] ring-offset-2"
      )}>
        {/* Main Content White Card */}
        <div
          onClick={handleCardClick}
          className="bg-white m-1.5 p-3 rounded-xl border-none shadow-none cursor-pointer group transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            {/* Image 60x60 */}
            <div className="w-[60px] h-[60px] relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
              {hasImage ? (
                <Image
                  src={imageUrl!}
                  alt={storeName}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setImageError(true)}
                />
              ) : (
                <TablerIcon className="h-6 w-6 text-[#7755FF]" strokeWidth={1.5} />
              )}
            </div>
            
            {/* Top Right: Price and Matches */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[15px] font-black text-[#1A1A1A]">
                {submission.price ? `$${submission.price}` : "Contact"}
              </span>
              
              {/* Matches with SVG */}
              {totalCriteria > 0 && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#7755FF]">
                  <span>{matchedRequirements.length}/{totalCriteria}</span>
                  <LogoSVG className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase text-gray-400 mb-0.5 block">
            {domain}
          </span>
          <h3 className="text-[16px] font-semibold text-[#1A1A1A] leading-tight mb-1" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>
            {storeName}
          </h3>

          <p className="text-[13px] text-gray-500 font-medium line-clamp-2 mb-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Identity & Interaction Section (Outside white card, inside themed bg) */}
        <div className="px-4 pb-3.5 pt-0.5 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
            <Avatar className="h-7 w-7 border border-white shadow-sm shrink-0">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-[9px] bg-gray-50 font-bold text-gray-400">
                {fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-[#1A1A1A] leading-tight">
                {fullName}
              </span>
              <span className="text-[13px] font-medium text-gray-400">
                · {formatTimeAgo(submission.created_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hideVotes && (
              <VoteButtons submission={submission} requestId={requestId} />
            )}
          </div>
        </div>

        {/* Dialogs */}
        {isPersonalItem && hasImage && imageUrl && (
          <ImagePreviewDialog
            imageUrl={imageUrl}
            alt={storeName}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        )}
        {isPersonalItem && (
          <ContactInfoDialog
            open={contactDialogOpen}
            onOpenChange={setContactDialogOpen}
            submitterProfile={submitterProfile}
            imageUrl={imageUrl}
            itemName={storeName}
            description={description}
            price={submission.price}
          />
        )}
        {isRequestOwner && (
          <MessageProposerDialog
            open={messageDialogOpen}
            onOpenChange={setMessageDialogOpen}
            requestId={requestId}
            requestTitle={requestTitle || storeName}
            proposerId={submission.user_id}
            proposerName={fullName || "Proposer"}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <Card
      onClick={handleCardClick}
      className={cn(
        "cursor-pointer shadow-none border-none bg-transparent group",
        isBest && "ring-2 ring-[#ff4f27] ring-offset-2 rounded-[22px]"
      )}
    >
      <div className={cn("p-0 rounded-[20px] flex flex-col gap-1 h-full border border-gray-100", theme.bg)}>
        <div className="bg-white rounded-[16px] overflow-hidden flex flex-col h-full">
          <div className="flex flex-col flex-none p-5 pb-0">
            <div className="flex flex-col mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[18px] font-medium text-[#1A1A1A] leading-tight" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>
                    {storeName}
                  </h3>
                </div>
              </div>

              {totalCriteria > 0 && (
                <div className="flex items-center gap-1 mt-2.5">
                  {Array.from({ length: totalCriteria }).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 202 203" fill="none" xmlns="http://www.w3.org/2000/svg" 
                      className={cn(
                        "w-4 h-4 transition-opacity",
                        i < matchedRequirements.length ? "opacity-100" : "opacity-20"
                      )}
                    >
                      <path d="M89.6903 22.7515C101.076 22.7563 112.238 24.926 122.626 29.0308L98.3797 53.2769C95.5141 52.856 92.6103 52.6421 89.6903 52.6421C73.8365 52.6621 58.6379 58.9689 47.4276 70.1792C36.2173 81.3895 29.9104 96.5882 29.8904 112.442C29.8905 124.269 33.3977 135.831 39.9686 145.665C46.5395 155.499 55.8785 163.164 66.8055 167.69C77.7324 172.216 89.7563 173.4 101.356 171.092C112.956 168.785 123.612 163.089 131.975 154.726C140.338 146.363 146.033 135.708 148.341 124.108C149.513 118.214 149.782 112.211 149.171 106.297L173.889 81.5786C177.482 91.3728 179.376 101.809 179.381 112.442C179.381 130.181 174.12 147.522 164.264 162.271C154.409 177.02 140.402 188.516 124.013 195.304C107.625 202.093 89.5904 203.869 72.1922 200.409C54.7941 196.948 38.8127 188.405 26.2694 175.862C13.7261 163.318 5.18415 147.337 1.72346 129.939C-1.73716 112.541 0.038578 94.5073 6.82697 78.1187C13.6154 61.7299 25.1117 47.722 39.8612 37.8667C54.6106 28.0115 71.9513 22.7515 89.6903 22.7515ZM138.41 37.1548C143.671 40.5602 148.6 44.5321 153.099 49.0317C155.366 51.2985 157.498 53.6758 159.492 56.1479L159.311 56.3296L159.304 56.3228L138.179 77.4468C134.843 72.8249 130.854 68.6901 126.323 65.1782L147.126 44.3765L138.41 37.1548Z" fill="#7755FF"/>
                      <path d="M89.6924 137.599C103.586 137.599 114.85 126.336 114.85 112.442C114.85 98.5482 103.586 87.2849 89.6924 87.2849C75.7984 87.2849 64.5352 98.5482 64.5352 112.442C64.5352 126.336 75.7984 137.599 89.6924 137.599Z" fill="#7755FF"/>
                      <path d="M164.933 1.11172L171.519 31.1458L201.522 37.701L168.319 70.904L149.799 66.8899L137.01 79.6786L136.801 79.5108L136.999 79.68L96.9381 119.741L82.8844 105.687L121.864 66.7076L121.869 66.7118L135.745 52.8362L131.73 34.3147L164.933 1.11172Z" fill="#7755FF"/>
                    </svg>
                  ))}
                </div>
              )}
            </div>

            <div className={cn(
              "aspect-[4/3] relative w-full overflow-hidden bg-gray-50/50 rounded-xl mb-6 border border-gray-100",
              !hasImage && "flex items-center justify-center"
            )}>
              {hasImage ? (
                <Image
                  src={imageUrl!}
                  alt={storeName}
                  fill
                  className="object-cover"
                  priority={isFirst}
                  unoptimized
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <TablerIcon className="h-12 w-12 text-[#7755FF]" strokeWidth={1.5} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col flex-1 p-5 pt-0 pb-0">
            <p className="text-[15px] sm:text-[17px] font-medium leading-relaxed text-[#1A1A1A]/70 mb-8 line-clamp-3">
              {description || "The seller has not provided additional summary details for this proposal."}
            </p>
          </div>

          <div className="mt-auto border-t border-gray-100">
            <div className="flex items-stretch">
              <div className="flex flex-col items-start flex-1 py-5 px-6 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Type
                </span>
                <span className="text-[16px] sm:text-[18px] font-bold text-[#1A1A1A] leading-tight truncate w-full">
                  {domain}
                </span>
              </div>
              <div className="w-px shrink-0 bg-gray-100"></div>
              <div className="flex flex-col items-start flex-1 py-5 px-6 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Price
                </span>
                <span className="text-[16px] sm:text-[18px] font-bold text-[#1A1A1A] leading-tight truncate w-full">
                  {submission.price ? `$${submission.price}` : "Contact for price"}
                  {submission.price && submission.price_suffix && (
                    <span className="text-[13px] font-medium text-gray-400 ml-1">
                      {submission.price_suffix}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 px-5">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-white shadow-sm shrink-0">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-[10px] bg-gray-50 font-bold text-gray-400">
                  {fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-[#1A1A1A] leading-none truncate">
                  {fullName}
                </span>
                {username && (
                  <span className="text-[11px] font-medium text-gray-400 leading-tight">
                    @{username}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!hideVotes && (
                <VoteButtons submission={submission} requestId={requestId} />
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                <IconChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
          </div>
        </div>
      </div>
      {/* Fullscreen image preview for personal items */}
      {isPersonalItem && hasImage && imageUrl && (
        <ImagePreviewDialog
          imageUrl={imageUrl}
          alt={storeName}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}

      {/* Contact info dialog for personal items (for everyone) */}
      {isPersonalItem && (
        <ContactInfoDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          submitterProfile={submitterProfile}
          imageUrl={imageUrl}
          itemName={storeName}
          description={description}
          price={submission.price}
        />
      )}

      {/* Message proposer dialog */}
      {isRequestOwner && (
        <MessageProposerDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          requestId={requestId}
          requestTitle={requestTitle || storeName}
          proposerId={submission.user_id}
          proposerName={fullName || "Proposer"}
        />
      )}
      </Card>
    </>
  );
}



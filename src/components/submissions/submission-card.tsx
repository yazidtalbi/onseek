"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Submission } from "@/lib/types";
import { VoteButtons } from "@/components/submissions/vote-buttons";
import { WinnerButton } from "@/components/submissions/winner-button";
import { ReportDialog } from "@/components/reports/report-dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Link as LinkIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils/time";
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

function getHost(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export function SubmissionCard({
  submission,
  requestId,
  isWinner,
  canSelectWinner,
  onWinnerSelected,
  disableWinnerAction,
  isFirst = false,
  isLast = false,
  hideVotes = false,
  requestOwnerId,
}: {
  submission: Submission;
  requestId: string;
  isWinner?: boolean;
  canSelectWinner?: boolean;
  onWinnerSelected?: (submissionId: string) => void;
  disableWinnerAction?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  hideVotes?: boolean;
  requestOwnerId?: string;
}) {
  const host = getHost(submission.url);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [contactDialogOpen, setContactDialogOpen] = React.useState(false);
  const [submitterProfile, setSubmitterProfile] = React.useState<Profile | null>(null);
  const { user } = useAuth();
  const submittedAt = formatTimeAgo(submission.created_at);
  
  // Check if current user is the request owner
  const isRequestOwner = user?.id === requestOwnerId;

  // Fetch thumbnail URL on mount or use uploaded image for personal items
  React.useEffect(() => {
    if (submission.url === "personal-item" && submission.image_url) {
      // Use uploaded image for personal items
      setThumbnailUrl(submission.image_url);
    } else if (submission.url && submission.url !== "personal-item") {
      // Fetch thumbnail for link submissions
      fetch(`/api/link-preview?url=${encodeURIComponent(submission.url)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.imageUrl) {
            setThumbnailUrl(data.imageUrl);
          }
        })
        .catch((err) => {
          console.error("Error fetching thumbnail:", err);
        });
    }
  }, [submission.url, submission.image_url]);

  // Determine image URL to display
  const imageUrl = submission.image_url || thumbnailUrl;
  const hasImage = imageUrl && !imageError;
  const storeName = submission.article_name || host || "Submission";
  const description = submission.notes
    ? submission.notes.replace(/^\[Personal Item\]\s*/i, "")
    : "";
  const domain = submission.url === "personal-item" ? "Personal item" : host;
  const isPersonalItem = submission.url === "personal-item";
  // Get username from profiles relation
  const username = (submission as any).profiles?.username;

  // Fetch submitter profile when contact dialog opens (for everyone)
  React.useEffect(() => {
    if (contactDialogOpen && submission.user_id) {
      const fetchProfile = async () => {
        const supabase = createBrowserSupabaseClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", submission.user_id)
          .single();
        if (profile) {
          setSubmitterProfile(profile);
        }
      };
      fetchProfile();
    }
  }, [contactDialogOpen, submission.user_id]);

  // Pre-fetch profile for personal items (to check if contact info exists)
  const [hasContactInfo, setHasContactInfo] = React.useState(false);
  React.useEffect(() => {
    if (isPersonalItem && submission.user_id && !contactDialogOpen) {
      const checkContactInfo = async () => {
        const supabase = createBrowserSupabaseClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("contact_email, contact_phone, contact_whatsapp, contact_telegram")
          .eq("id", submission.user_id)
          .single();
        if (profile && (
          profile.contact_email || 
          profile.contact_phone || 
          profile.contact_whatsapp || 
          profile.contact_telegram
        )) {
          setHasContactInfo(true);
        }
      };
      checkContactInfo();
    }
  }, [isPersonalItem, submission.user_id, contactDialogOpen]);

  return (
    <Card
      className={cn(
        "border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:bg-[#f9fafb] group cursor-pointer rounded-2xl"
      )}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Top row: Username/time on left, Ellipsis menu on right */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {username ? (
              <>
                <Link
                  href={`/app/profile/${username}`}
                  className="text-xs text-neutral-500 hover:text-neutral-700 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{username}
                </Link>
                <span className="text-xs text-neutral-400">•</span>
              </>
            ) : null}
            <span className="text-xs text-neutral-500">{submittedAt}</span>
            {user?.id === submission.user_id && (
              <>
                <span className="text-xs text-neutral-400">•</span>
                <Badge variant="outline" className="text-xs font-medium text-[#7755FF] border-[#7755FF] bg-[#7755FF]/10 px-2 py-0 h-5">
                  You
                </Badge>
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setReportOpen(true)}>
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ReportDialog
            type="submission"
            targetId={submission.id}
            open={reportOpen}
            onOpenChange={setReportOpen}
          />
        </div>

        {/* Main 3-column layout */}
        <div className="flex gap-3 sm:gap-4 mb-3">
          {/* Left: Preview square */}
          <div className="flex-shrink-0">
            {hasImage ? (
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border border-neutral-200 bg-neutral-100">
                <Image
                  src={imageUrl}
                  alt={storeName}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => {
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-md border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-neutral-400" />
              </div>
            )}
          </div>

          {/* Center: Content stack */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-neutral-900 line-clamp-1">
                {storeName}
              </h3>
              {isPersonalItem ? (
                <>
                  <span className="text-xs text-neutral-400">•</span>
                  <span className="text-xs text-neutral-500">Personal item</span>
                </>
              ) : domain ? (
                <>
                  <span className="text-xs text-neutral-400">•</span>
                  <a
                    href={submission.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {domain}
                  </a>
                </>
              ) : null}
            </div>
            {description && (
              <p className="text-sm text-neutral-600 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Right: Price aligned top-right */}
          {submission.price && (
            <div className="flex-shrink-0 text-right">
              <span className="font-semibold text-neutral-900 text-base sm:text-lg">
                ${submission.price.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Bottom row: Winner badge (if applicable) on far left, Select winner button, View item + Voting on far right */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Far-left: Winner badge (prominent orange) or Select winner button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isWinner ? (
              <Badge className="bg-[#FF5F00] text-white border-0 text-sm font-semibold px-3 py-1">
                Picked
              </Badge>
            ) : canSelectWinner ? (
              <WinnerButton
                requestId={requestId}
                submissionId={submission.id}
                onSelected={onWinnerSelected}
                disabled={disableWinnerAction}
              />
            ) : null}
          </div>

          {/* Far-right: View item button and Voting control next to each other */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (isPersonalItem && hasImage) {
                  // For personal items, show contact dialog
                  setContactDialogOpen(true);
                } else if (!isPersonalItem && submission.url) {
                  window.open(submission.url, "_blank", "noopener,noreferrer");
                }
              }}
              className="flex-shrink-0 bg-[#F2F3F5] text-[#363B40] hover:bg-[#F2F3F5]/90 cursor-pointer"
              disabled={isPersonalItem && !hasImage}
            >
              View item
            </Button>
            {hideVotes ? (
              <Link
                href={`/app/requests/${requestId}`}
                className="text-sm text-[#7755FF] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View request
              </Link>
            ) : (
              <VoteButtons submission={submission} requestId={requestId} />
            )}
          </div>
        </div>
      </CardContent>

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
    </Card>
  );
}



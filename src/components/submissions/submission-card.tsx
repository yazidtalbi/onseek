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
import { MoreHorizontal, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils/time";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}: {
  submission: Submission;
  requestId: string;
  isWinner?: boolean;
  canSelectWinner?: boolean;
  onWinnerSelected?: (submissionId: string) => void;
  disableWinnerAction?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const host = getHost(submission.url);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const submittedAt = formatTimeAgo(submission.created_at);

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

  return (
    <Card
      className={cn(
        "border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:bg-[#f9fafb] group cursor-pointer",
        isWinner && "border-2 border-[#FF5F00] bg-[#FFDECA]/20",
        isFirst && isLast && "rounded-2xl",
        isFirst && !isLast && "rounded-t-2xl rounded-b-none",
        !isFirst && isLast && "rounded-b-2xl rounded-t-none",
        !isFirst && !isLast && "rounded-none",
        !isLast && "border-b-0"
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

        {/* Bottom row: View item button, Voting */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Left: Empty space */}
          <div className="flex-1 min-w-0"></div>

          {/* Center-right: View item button */}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (isPersonalItem && hasImage) {
                setPreviewOpen(true);
              } else if (!isPersonalItem && submission.url) {
                window.open(submission.url, "_blank", "noopener,noreferrer");
              }
            }}
            className="flex-shrink-0 bg-[#F2F3F5] text-[#363B40] hover:bg-[#F2F3F5]/90 cursor-pointer"
            disabled={isPersonalItem && !hasImage}
          >
            View item
          </Button>

          {/* Far-right: Voting control */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isWinner && (
              <Badge variant="default" className="text-xs">
                Winner
              </Badge>
            )}
            <VoteButtons submission={submission} requestId={requestId} />
          </div>
        </div>

        {/* Winner selection button (if applicable) */}
        {canSelectWinner && (
          <div className="mt-3 pt-3">
            <WinnerButton
              requestId={requestId}
              submissionId={submission.id}
              onSelected={onWinnerSelected}
              disabled={disableWinnerAction}
            />
          </div>
        )}
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
    </Card>
  );
}



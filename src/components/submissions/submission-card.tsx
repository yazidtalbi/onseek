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
import { MoreVertical } from "lucide-react";
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

  return (
    <Card className={cn(
      isWinner ? "border-2 border-[#FF5F00] bg-[#FFDECA]/20" : "border-[#e5e7eb] bg-white",
      isFirst && isLast && "rounded-2xl",
      isFirst && !isLast && "rounded-t-2xl rounded-b-none",
      !isFirst && isLast && "rounded-b-2xl rounded-t-none",
      !isFirst && !isLast && "rounded-none",
      !isLast && "border-b-0"
    )}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <VoteButtons submission={submission} requestId={requestId} />
          <div className="flex items-center gap-4">
            {isWinner ? (
              <div className="flex-shrink-0">
                <Badge variant="default">Winner</Badge>
              </div>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setReportOpen(true)}>
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ReportDialog type="submission" targetId={submission.id} open={reportOpen} onOpenChange={setReportOpen} />
          </div>
        </div>
        <div className="flex gap-4">
          {thumbnailUrl && !imageError ? (
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-100 flex items-center justify-center">
              <Image
                src={thumbnailUrl}
                alt={submission.article_name || host || "Product preview"}
                fill
                className="object-cover"
                unoptimized
                onError={() => {
                  setImageError(true);
                }}
              />
            </div>
          ) : submission.url !== "personal-item" ? (
            <div className="w-32 h-32 flex-shrink-0 rounded-lg border border-[#e5e7eb] bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-2">No preview</span>
            </div>
          ) : submission.url === "personal-item" && !submission.image_url ? (
            <div className="w-32 h-32 flex-shrink-0 rounded-lg border border-[#e5e7eb] bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-2">No image</span>
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {submission.article_name || host || "Submission link"}
                  </h3>
                  {submission.url === "personal-item" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Personal item
                    </span>
                  )}
                </div>
                {submission.url !== "personal-item" && (
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground truncate hover:text-gray-400 transition-colors block"
                  >
                    {submission.url}
                  </a>
                )}
              </div>
            </div>
            {submission.price && (
              <div className="mb-2">
                <span className="text-lg font-semibold text-[#7755FF]">
                  ${submission.price.toFixed(2)}
                </span>
              </div>
            )}
            {submission.notes ? (
              <p className="text-sm text-muted-foreground">
                {submission.notes.replace(/^\[Personal Item\]\s*/i, "")}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-end gap-3">
              {canSelectWinner ? (
                <WinnerButton
                  requestId={requestId}
                  submissionId={submission.id}
                  onSelected={onWinnerSelected}
                  disabled={disableWinnerAction}
                />
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


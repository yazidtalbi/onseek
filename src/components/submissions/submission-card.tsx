"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Submission } from "@/lib/types";
import { VoteButtons } from "@/components/submissions/vote-buttons";
import { WinnerButton } from "@/components/submissions/winner-button";
import { ReportDialog } from "@/components/reports/report-dialog";
import Image from "next/image";

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
}: {
  submission: Submission;
  requestId: string;
  isWinner?: boolean;
  canSelectWinner?: boolean;
  onWinnerSelected?: (submissionId: string) => void;
  disableWinnerAction?: boolean;
}) {
  const host = getHost(submission.url);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);

  // Fetch thumbnail URL on mount
  React.useEffect(() => {
    if (submission.url && submission.url !== "personal-item") {
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
  }, [submission.url]);

  return (
    <Card className={isWinner ? "border-2 border-[#FF5F00] bg-[#FFDECA]/20" : "border-[#e5e7eb] bg-white"}>
      <CardContent className="space-y-4 p-6">
        <div className="flex gap-4">
          {thumbnailUrl && !imageError ? (
            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-100 flex items-center justify-center">
              <Image
                src={thumbnailUrl}
                alt={submission.article_name || host || "Product preview"}
                fill
                className="object-contain"
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
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="space-y-1 flex-1 min-w-0">
                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-foreground hover:text-gray-400 transition-colors block truncate"
                >
                  {submission.article_name || host || "Submission link"}
                </a>
                <p className="text-xs text-muted-foreground truncate">{submission.url}</p>
              </div>
              {isWinner ? (
                <div className="flex-shrink-0">
                  <Badge variant="default">Winner</Badge>
                </div>
              ) : null}
            </div>
            {submission.price && (
              <div className="mb-2">
                <span className="text-2xl font-semibold text-[#7755FF]">
                  ${submission.price.toFixed(2)}
                </span>
              </div>
            )}
            {submission.notes ? (
              <p className="text-sm text-muted-foreground">{submission.notes}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <VoteButtons submission={submission} requestId={requestId} />
                <span className="text-sm font-semibold text-foreground">
                  Score {submission.score ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canSelectWinner ? (
                  <WinnerButton
                    requestId={requestId}
                    submissionId={submission.id}
                    onSelected={onWinnerSelected}
                    disabled={disableWinnerAction}
                  />
                ) : null}
                <ReportDialog type="submission" targetId={submission.id} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


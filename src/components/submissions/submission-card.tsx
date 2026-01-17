import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Submission } from "@/lib/types";
import { VoteButtons } from "@/components/submissions/vote-buttons";
import { WinnerButton } from "@/components/submissions/winner-button";
import { ReportDialog } from "@/components/reports/report-dialog";

const allowlist = ["amazon.com", "aliexpress.com", "ebay.com", "etsy.com"];

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
  const isTrusted = host && allowlist.some((item) => host.includes(item));

  return (
    <Card className="border-border bg-white/80">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <a
              href={submission.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold"
            >
              {submission.store_name || host || "Submission link"}
            </a>
            <p className="text-xs text-muted-foreground">{submission.url}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isWinner ? <Badge>Winner</Badge> : null}
            {!isTrusted ? (
              <Badge variant="outline">Unknown domain</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {submission.price ? <span>${submission.price.toFixed(2)}</span> : null}
          {submission.shipping_cost ? (
            <span>Shipping ${submission.shipping_cost.toFixed(2)}</span>
          ) : null}
          <span>Score {submission.score ?? 0}</span>
        </div>
        {submission.notes ? (
          <p className="text-sm text-muted-foreground">{submission.notes}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <VoteButtons submission={submission} requestId={requestId} />
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
      </CardContent>
    </Card>
  );
}


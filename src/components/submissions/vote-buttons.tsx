"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { voteAction } from "@/actions/vote.actions";
import type { Submission } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/layout/auth-provider";

export function VoteButtons({
  submission,
  requestId,
}: {
  submission: Submission;
  requestId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const { user } = useAuth();
  const isOwnSubmission = user?.id === submission.user_id;

  const handleVote = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("submissionId", submission.id);
      formData.set("vote", "1");
      formData.set("requestId", requestId);
      await voteAction(formData);
      router.refresh();
    });
  };

  const score = submission.score ?? 0;

  return (
    <div className="flex items-center gap-0 rounded-full border border-neutral-200 bg-white overflow-hidden h-9 pr-1">
      <button
        type="button"
        onClick={handleVote}
        disabled={isPending || isOwnSubmission}
        className={cn(
          "flex items-center justify-center h-full px-2 transition-colors",
          isOwnSubmission ? "cursor-not-allowed opacity-50" : "hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
        )}
        title={isOwnSubmission ? "You cannot upvote your own submission" : "Upvote"}
        aria-label="Upvote"
      >
        <ChevronUp
          className={cn(
            "h-4 w-4",
            submission.has_voted === 1 ? "text-[#FF5F00]" : (isOwnSubmission ? "text-neutral-300" : "text-neutral-400")
          )}
        />
      </button>
      <span className={cn(
        "text-sm min-w-[1.5rem] font-semibold px-1 flex items-center justify-center h-full",
        submission.has_voted === 1 ? "text-[#FF5F00]" : "text-neutral-400"
      )}>
        {score}
      </span>
    </div>
  );
}


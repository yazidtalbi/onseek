"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronUp } from "lucide-react";
import { voteAction } from "@/actions/vote.actions";
import type { Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VoteButtons({
  submission,
  requestId,
}: {
  submission: Submission;
  requestId: string;
}) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = React.useTransition();

  const mutateVote = useMutation({
    mutationFn: async (vote: 1) => {
      const formData = new FormData();
      formData.set("submissionId", submission.id);
      formData.set("vote", String(vote));
      formData.set("requestId", requestId);
      await voteAction(formData);
    },
    onMutate: async (vote) => {
      await queryClient.cancelQueries({ queryKey: ["submissions", requestId] });
      const previous = queryClient.getQueryData<Submission[]>([
        "submissions",
        requestId,
      ]);
      queryClient.setQueryData<Submission[]>(
        ["submissions", requestId],
        (old) =>
          old?.map((item) => {
            if (item.id !== submission.id) return item;
            const currentVote = item.has_voted || 0;
            let delta: number = 0;
            if (currentVote === vote) {
              // Toggle off: remove upvote
              delta = -1;
              item.has_voted = 0;
            } else {
              // Add upvote
              delta = 1;
              item.has_voted = vote;
            }
            const upvotes = (item.upvotes || 0) + delta;
            return {
              ...item,
              upvotes,
              score: upvotes || 0,
            };
          }) ?? []
      );
      return { previous };
    },
    onError: (_err, _vote, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["submissions", requestId],
          context.previous
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", requestId] });
    },
  });

  const handleVote = () => {
    startTransition(() => mutateVote.mutate(1));
  };

  const score = submission.score ?? 0;

  return (
    <div className="flex items-center gap-0 rounded-full border border-neutral-200 overflow-hidden h-9 pr-1">
      <button
        type="button"
        onClick={handleVote}
        disabled={isPending}
        className="flex items-center justify-center h-full px-2 hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
        aria-label="Upvote"
      >
        <ChevronUp
          className={cn(
            "h-4 w-4",
            submission.has_voted === 1 ? "text-[#FF5F00]" : "text-neutral-400"
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


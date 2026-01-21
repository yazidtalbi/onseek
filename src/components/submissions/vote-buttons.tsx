"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronUp, ChevronDown } from "lucide-react";
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
    mutationFn: async (vote: 1 | -1) => {
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
            let delta: number = vote;
            if (currentVote === vote) {
              delta = (-vote) as 1 | -1;
              item.has_voted = 0;
            } else {
              if (currentVote !== 0) {
                delta = vote - currentVote;
              }
              item.has_voted = vote;
            }
            const upvotes = (item.upvotes || 0) + (delta === 1 ? 1 : 0);
            const downvotes = (item.downvotes || 0) + (delta === -1 ? 1 : 0);
            return {
              ...item,
              upvotes,
              downvotes,
              score: (upvotes || 0) - (downvotes || 0),
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

  const handleVote = (vote: 1 | -1) => {
    startTransition(() => mutateVote.mutate(vote));
  };

  const score = submission.score ?? 0;

  return (
    <div className="flex items-center rounded-full border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isPending}
        className="flex items-center justify-center px-2 py-1.5 hover:bg-gray-100 transition-colors"
      >
        <ChevronUp
          className={cn(
            "h-4 w-4",
            submission.has_voted === 1 ? "text-orange-500" : "text-gray-600"
          )}
        />
      </button>
      <div className="h-6 w-px bg-border"></div>
      <div className="px-3 py-1.5 min-w-[2.5rem] text-center">
        <span className="text-sm font-semibold text-foreground">{score}</span>
      </div>
      <div className="h-6 w-px bg-border"></div>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className="flex items-center justify-center px-2 py-1.5 hover:bg-gray-100 transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4",
            submission.has_voted === -1 ? "text-orange-500" : "text-gray-600"
          )}
        />
      </button>
    </div>
  );
}


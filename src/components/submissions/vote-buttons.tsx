"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp, ThumbsDown } from "lucide-react";
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

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold",
          submission.has_voted === 1
            ? "bg-primary text-primary-foreground"
            : "bg-white/70 text-muted-foreground"
        )}
      >
        <ThumbsUp className="h-3 w-3" />
        Upvote
      </button>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold",
          submission.has_voted === -1
            ? "bg-accent text-accent-foreground"
            : "bg-white/70 text-muted-foreground"
        )}
      >
        <ThumbsDown className="h-3 w-3" />
        Downvote
      </button>
    </div>
  );
}


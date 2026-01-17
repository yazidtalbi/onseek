"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Submission } from "@/lib/types";
import { SubmissionCard } from "@/components/submissions/submission-card";

function computeScore(
  item: Submission & {
    votes?: { vote: number; user_id: string }[];
    profiles?: { reputation: number | null };
  },
  userId?: string | null
) {
  const votes = item.votes;
  const upvotes = votes?.filter((v) => v.vote === 1).length || 0;
  const downvotes = votes?.filter((v) => v.vote === -1).length || 0;
  const hasVoted = votes?.find((v) => v.user_id === userId)?.vote || 0;
  const reputationBonus = Math.floor((item.profiles?.reputation ?? 0) / 50);
  return {
    ...item,
    upvotes,
    downvotes,
    score: upvotes - downvotes + reputationBonus,
    has_voted: hasVoted,
  } as Submission;
}

export function SubmissionList({
  requestId,
  initialSubmissions,
  winnerId,
  canSelectWinner,
  requestStatus,
}: {
  requestId: string;
  initialSubmissions: Submission[];
  winnerId?: string | null;
  canSelectWinner?: boolean;
  requestStatus?: "open" | "closed" | "solved";
}) {
  const [localWinner, setLocalWinner] = React.useState<string | null>(
    winnerId ?? null
  );
  const [localStatus, setLocalStatus] = React.useState<
    "open" | "closed" | "solved" | undefined
  >(requestStatus);
  const { data } = useQuery({
    queryKey: ["submissions", requestId],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: submissions } = await supabase
        .from("submissions")
        .select("*, votes(vote, user_id), profiles(reputation)")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });
      return (
        submissions?.map((item) => computeScore(item as Submission, user?.id)) ??
        []
      );
    },
    initialData: initialSubmissions,
  });

  if (!data?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white/50 p-6 text-center text-sm text-muted-foreground">
        No submissions yet. Be the first to help!
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-4">
      {sorted.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          requestId={requestId}
          isWinner={localWinner === submission.id}
          canSelectWinner={canSelectWinner && localStatus === "open"}
          onWinnerSelected={(id) => {
            setLocalWinner(id);
            setLocalStatus("solved");
          }}
          disableWinnerAction={localStatus !== "open"}
        />
      ))}
    </div>
  );
}


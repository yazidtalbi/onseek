"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Submission } from "@/lib/types";
import { SubmissionCard } from "@/components/submissions/submission-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function computeScore(
  item: Submission & {
    votes?: { vote: number; user_id: string }[];
  },
  userId?: string | null
) {
  const votes = item.votes;
  const upvotes = votes?.filter((v) => v.vote === 1).length || 0;
  const downvotes = votes?.filter((v) => v.vote === -1).length || 0;
  const hasVoted = votes?.find((v) => v.user_id === userId)?.vote || 0;
  return {
    ...item,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    has_voted: hasVoted,
  } as Submission;
}

export function SubmissionList({
  requestId,
  initialSubmissions,
  winnerId,
  canSelectWinner,
  requestStatus,
  requestOwnerId,
}: {
  requestId: string;
  initialSubmissions: Submission[];
  winnerId?: string | null;
  canSelectWinner?: boolean;
  requestStatus?: "open" | "closed" | "solved";
  requestOwnerId?: string;
}) {
  const [localWinner, setLocalWinner] = React.useState<string | null>(
    winnerId ?? null
  );
  const [localStatus, setLocalStatus] = React.useState<
    "open" | "closed" | "solved" | undefined
  >(requestStatus);
  const [sortBy, setSortBy] = React.useState<"best" | "newest" | "price">("best");
  const { data } = useQuery({
    queryKey: ["submissions", requestId],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: submissions } = await supabase
        .from("submissions")
        .select("*, votes(vote, user_id), profiles(username)")
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
      <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white/50 p-6 text-center text-sm text-gray-600">
        No submissions yet. Be the first to help!
      </div>
    );
  }

  const sorted = React.useMemo(() => {
    const submissions = [...data];
    switch (sortBy) {
      case "best":
        return submissions.sort((a, b) => (b.score || 0) - (a.score || 0));
      case "newest":
        return submissions.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "price":
        return submissions.sort((a, b) => {
          const priceA = a.price || Infinity;
          const priceB = b.price || Infinity;
          return priceA - priceB;
        });
      default:
        return submissions;
    }
  }, [data, sortBy]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-neutral-400">
          {data.length} {data.length === 1 ? 'proposal' : 'proposals'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(value: "best" | "newest" | "price") => setSortBy(value)}>
            <SelectTrigger className="w-[120px] h-9 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best">Best</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {sorted.map((submission, index) => (
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
          isFirst={index === 0}
          isLast={index === sorted.length - 1}
          requestOwnerId={requestOwnerId}
        />
      ))}
    </div>
  );
}


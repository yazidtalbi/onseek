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
import Image from "next/image";
import { Sparkles, LayoutGrid, Rows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  requestTitle,
  initialSubmissions,
  winnerId,
  canSelectWinner,
  requestStatus,
  requestOwnerId,
  hideTitle,
  largeText,
  layout,
  requestPreferences,
  requestDealbreakers,
  isOwner = false,
  showSubmissionForm = true,
  hideEmptyState = false,
}: {
  requestId: string;
  requestTitle?: string;
  initialSubmissions: Submission[];
  winnerId?: string | null;
  canSelectWinner?: boolean;
  requestStatus?: "open" | "closed" | "solved" | "pending" | "rejected" | "archived";
  requestOwnerId?: string;
  hideTitle?: boolean;
  largeText?: boolean;
  layout?: "vertical" | "horizontal";
  requestPreferences?: any[];
  requestDealbreakers?: any[];
  isOwner?: boolean;
  showSubmissionForm?: boolean;
  hideEmptyState?: boolean;
}) {
  const [localWinner, setLocalWinner] = React.useState<string | null>(
    winnerId ?? null
  );
  const [localStatus, setLocalStatus] = React.useState<
    "open" | "closed" | "solved" | "pending" | "rejected" | "archived" | undefined
  >(requestStatus);
  const [sortBy, setSortBy] = React.useState<"best" | "newest" | "price">("best");
  const [viewMode, setViewMode] = React.useState<"expanded" | "compact">("compact");
  const submissions = initialSubmissions;

  if (!submissions?.length) {
    if (hideEmptyState) return null;
    return (
      <div className="rounded-2xl p-6 sm:p-12 text-center bg-transparent">
        {/* Illustration with Stars */}
        <div className="relative flex items-center justify-center mb-6 sm:mb-8">
          <div className="relative z-10">
            {/* Stars - positioned around the illustration */}
            <Sparkles className="absolute -top-1 -left-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 rotate-12" />
            <Sparkles className="absolute -top-1 right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 -rotate-12" />
            <Sparkles className="absolute top-2 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 rotate-45" />
            <Sparkles className="absolute -bottom-1 left-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 -rotate-45" />

            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <Image
                src="/illustrations/2.png"
                alt="Achievement"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-xl sm:text-2xl font-medium text-neutral-900 mb-3" style={{ fontFamily: 'var(--font-expanded)' }}>
          {isOwner ? "Sellers will see your request" : "Be the first to help"}
        </h3>

        {/* Body Text */}
        <p className="text-xs sm:text-sm text-gray-600 mb-6 max-w-md mx-auto">
          {isOwner
            ? "We'll notify you as soon as someone shares a product that matches your criteria."
            : "Share a product or item that matches this request"}
        </p>
      </div>
    );
  }

  const sorted = React.useMemo(() => {
    const subs = [...submissions];
    switch (sortBy) {
      case "best":
        return subs.sort((a, b) => (b.score || 0) - (a.score || 0));
      case "newest":
        return subs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "price":
        return subs.sort((a, b) => {
          const priceA = a.price || Infinity;
          const priceB = b.price || Infinity;
          return priceA - priceB;
        });
      default:
        return subs;
    }
  }, [submissions, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 px-2 sm:px-0">
        <div className="text-[12px] font-medium text-gray-500" style={{ fontFamily: 'var(--font-inter-display)' }}>
          {submissions.length} {submissions.length === 1 ? 'Proposal' : 'Proposals'}
        </div>
        <div className="flex items-center gap-2">
          {/* View Switcher hidden for now */}
          {/* 
          <div className="flex items-center bg-gray-100/50 p-1 rounded-full border border-gray-100">
            <button
              onClick={() => setViewMode("expanded")}
              className={cn(
                "p-2 rounded-full transition-all",
                viewMode === "expanded" ? "bg-white shadow-sm text-[#1A1A1A]" : "text-gray-400 hover:text-gray-600"
              )}
              title="Expanded View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={cn(
                "p-2 rounded-full transition-all",
                viewMode === "compact" ? "bg-white shadow-sm text-[#1A1A1A]" : "text-gray-400 hover:text-gray-600"
              )}
              title="Compact View"
            >
              <Rows className="h-4 w-4" />
            </button>
          </div>
          */}

          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(value: "best" | "newest" | "price") => setSortBy(value)}>
              <SelectTrigger className="w-[110px] h-10 rounded-full border border-[#e5e7eb] bg-white text-sm font-bold shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-[#e5e7eb]">
                <SelectItem value="best" className="text-sm font-medium">Best</SelectItem>
                <SelectItem value="newest" className="text-sm font-medium">Newest</SelectItem>
                <SelectItem value="price" className="text-sm font-medium">Lowest price</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {sorted.map((submission, index) => (
          <div key={submission.id} className="w-full">
            <SubmissionCard
              submission={submission}
              requestId={requestId}
              requestTitle={requestTitle}
              isWinner={localWinner === submission.id}
              canSelectWinner={canSelectWinner && localStatus === "open"}
              onWinnerSelected={(id) => {
                setLocalWinner(id);
                setLocalStatus("solved");
              }}
              disableWinnerAction={localStatus !== "open"}
              isFirst={index === 0}
              isLast={index === sorted.length - 1}
              isOnlyOne={sorted.length === 1}
              requestOwnerId={requestOwnerId}
              largeText={largeText}
              requestPreferences={requestPreferences}
              requestDealbreakers={requestDealbreakers}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

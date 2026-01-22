"use client";

import { useState } from "react";
import { RequestCard } from "@/components/requests/request-card";
import { SubmissionCard } from "@/components/submissions/submission-card";
import { cn } from "@/lib/utils";
import type { RequestItem, Submission } from "@/lib/types";
import type { ActivityItem } from "@/components/profile/profile-activity";
import Link from "next/link";

export function ProfileTabs({
  requests,
  submissions,
  winners,
  requestImages,
  requestLinks,
  requestFavorites,
  submissionRequests,
  winningRequestIds,
  activities,
}: {
  requests: RequestItem[];
  submissions: Submission[];
  winners: Submission[];
  requestImages: Record<string, string[]>;
  requestLinks: Record<string, string[]>;
  requestFavorites: Set<string>;
  submissionRequests: Record<string, any>;
  winningRequestIds: string[];
  activities: ActivityItem[];
}) {
  const [activeTab, setActiveTab] = useState<"activity" | "requests" | "submissions" | "winners">("activity");

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const tabs = [
    { id: "activity" as const, label: "Activity", count: activities.length },
    { id: "requests" as const, label: "Requests", count: requests.length },
    { id: "submissions" as const, label: "Submissions", count: submissions.length },
    { id: "winners" as const, label: "Winners", count: winners.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors rounded-full",
              activeTab === tab.id
                ? "bg-foreground text-background"
                : "bg-gray-100 text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 text-xs opacity-70">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "activity" && (
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={activity.link}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#e5e7eb] bg-white hover:bg-gray-50 transition-colors group"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full shrink-0 flex items-center justify-center",
                    activity.points > 0 ? "bg-green-500/10 text-green-600" : 
                    activity.points < 0 ? "bg-red-500/10 text-red-600" : 
                    "bg-gray-100 text-gray-600"
                  )}>
                    {activity.type === "request" && <span className="text-xs font-semibold">+</span>}
                    {activity.type === "submission" && <span className="text-xs font-semibold">+</span>}
                    {activity.type === "winner" && <span className="text-xs font-semibold">✓</span>}
                    {activity.type === "vote" && <span className="text-xs font-semibold">↑</span>}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {activity.points !== 0 && (
                        <span className={cn(
                          "text-sm font-semibold",
                          activity.points > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {activity.points > 0 ? "+" : ""}{activity.points}
                        </span>
                      )}
                      <p className="text-sm text-foreground group-hover:text-foreground transition-colors">
                        {(() => {
                          const desc = activity.description;
                          // Patterns: "Posted [name]", "in [name]", "Accepted answer in [name]", "Received upvote on [name]"
                          const prefixes = ["Posted ", "in ", "Accepted answer in ", "Received upvote on "];
                          
                          for (const prefix of prefixes) {
                            const index = desc.indexOf(prefix);
                            if (index !== -1) {
                              const before = desc.slice(0, index);
                              const name = desc.slice(index + prefix.length);
                              
                              return (
                                <>
                                  {before}
                                  {prefix}
                                  <span className="text-[#7755FF]">{name}</span>
                                </>
                              );
                            }
                          }
                          
                          return desc;
                        })()}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-white/50 p-8 text-center text-sm text-muted-foreground">
                <p className="text-base font-medium mb-2">No activity yet</p>
                <p className="text-sm">This user hasn't had any activity yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-0">
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  variant="feed"
                  images={requestImages[request.id] || []}
                  links={requestLinks[request.id] || []}
                  isFavorite={requestFavorites.has(request.id)}
                  isFirst={index === 0}
                  isLast={index === requests.length - 1}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-white/50 p-8 text-center text-sm text-muted-foreground">
                <p className="text-base font-medium mb-2">No requests yet</p>
                <p className="text-sm">This user hasn't posted any requests.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="space-y-0">
            {submissions.length > 0 ? (
              submissions.map((submission, index) => {
                const request = submissionRequests[submission.request_id];
                if (!request) return null;
                return (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    requestId={submission.request_id}
                    isWinner={false}
                    isFirst={index === 0}
                    isLast={index === submissions.length - 1}
                    hideVotes={true}
                  />
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-white/50 p-8 text-center text-sm text-muted-foreground">
                <p className="text-base font-medium mb-2">No submissions yet</p>
                <p className="text-sm">This user hasn't made any submissions.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "winners" && (
          <div className="space-y-0">
            {winners.length > 0 ? (
              winners.map((submission, index) => {
                const request = submissionRequests[submission.request_id];
                if (!request) return null;
                return (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    requestId={submission.request_id}
                    isWinner={true}
                    isFirst={index === 0}
                    isLast={index === winners.length - 1}
                    hideVotes={true}
                  />
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-[#e5e7eb] bg-white/50 p-8 text-center text-sm text-muted-foreground">
                <p className="text-base font-medium mb-2">No winners yet</p>
                <p className="text-sm">This user hasn't won any requests yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, CheckCircle2, XCircle, MessageSquare, Award } from "lucide-react";
import type { Profile } from "@/lib/types";

export type ActivityItem = {
  id: string;
  type: "request" | "submission" | "winner" | "vote";
  points: number;
  description: string;
  link: string;
  timestamp: string;
};

export function ProfileActivity({
  profile,
  activities,
  requestsCount,
  submissionsCount,
  winnersCount,
  points,
}: {
  profile: Profile;
  activities: ActivityItem[];
  requestsCount: number;
  submissionsCount: number;
  winnersCount: number;
  points: number;
}) {
  const [activeTab, setActiveTab] = useState<"activity" | "questions" | "comments" | "answers" | "points">("activity");
  const router = useRouter();

  const questions = activities.filter((a) => a.type === "request");
  const answers = activities.filter((a) => a.type === "submission" || a.type === "winner");
  const comments: typeof activities = []; // Comments can be added later

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

  const getDisplayActivities = () => {
    switch (activeTab) {
      case "questions":
        return questions;
      case "answers":
        return answers;
      case "comments":
        return comments;
      case "points":
        return activities.filter((a) => a.points !== 0);
      default:
        return activities;
    }
  };

  const tabs = [
    { id: "activity" as const, label: "ACTIVITY", count: activities.length },
    { id: "questions" as const, label: "QUESTIONS", count: requestsCount },
    { id: "comments" as const, label: "COMMENTS", count: comments.length },
    { id: "answers" as const, label: "ANSWERS", count: submissionsCount },
    { id: "points" as const, label: "POINTS", count: points },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Profile Info */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-semibold">{profile.display_name || profile.username}'s profile</h2>
          {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="font-semibold text-foreground">{points}</span>
              <span className="text-muted-foreground ml-1">Points</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">{winnersCount}</span>
              <span className="text-muted-foreground ml-1">Solved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Activity Feed */}
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {getDisplayActivities().length > 0 ? (
            getDisplayActivities().map((activity) => (
              <Link
                key={activity.id}
                href={activity.link}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-gray-50 transition-colors group"
              >
                <div className={cn(
                  "p-1.5 rounded-full shrink-0",
                  activity.points > 0 ? "bg-green-500/10 text-green-600" : 
                  activity.points < 0 ? "bg-red-500/10 text-red-600" : 
                  "bg-muted text-muted-foreground"
                )}>
                  {activity.type === "request" && <Plus className="h-4 w-4" />}
                  {activity.type === "submission" && <Plus className="h-4 w-4" />}
                  {activity.type === "winner" && <CheckCircle2 className="h-4 w-4" />}
                  {activity.type === "vote" && <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
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
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No {activeTab === "activity" ? "activities" : activeTab} yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


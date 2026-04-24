"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils/time";
import { cn } from "@/lib/utils";
import { markNotificationReadAction } from "@/actions/notification.actions";
import { useRouter } from "next/navigation";
import { MessageSquare, Award, Bell } from "lucide-react";
import { createRequestUrl } from "@/lib/utils/slug";
import { useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    payload: any;
    read: boolean;
    created_at: string;
  };
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeAgo = formatTimeAgo(notification.created_at);
  const p = notification.payload || {};

  const handleClick = () => {
    if (!notification.read) {
      startTransition(async () => {
        await markNotificationReadAction(notification.id);
        router.refresh();
      });
    }
  };

  // Build the content dynamically based on type
  let avatarUrl = "";
  let avatarFallback = "?";
  let titleNode = <p className="text-sm text-neutral-900">New activity</p>;
  let bubbleContent = null;
  let link = null;

  if (notification.type === "new_submission") {
    avatarUrl = p.sender_avatar || "";
    avatarFallback = p.sender_name?.substring(0,2)?.toUpperCase() || "U";
    link = p.request_id ? createRequestUrl({ id: p.request_id }, searchParams) : null;
    titleNode = (
      <p className="text-sm text-neutral-800 leading-snug">
        <span className="font-semibold text-neutral-900">{p.sender_name || "User"}</span> made a proposal for <span className="font-semibold text-neutral-900">{p.request_title || "a request"}</span>
      </p>
    );
    bubbleContent = p.submission_title || "A new proposal was submitted.";
  } else if (notification.type === "new_message") {
    avatarUrl = p.sender_avatar || "";
    avatarFallback = p.sender_name?.substring(0,2)?.toUpperCase() || "U";
    link = "/messages";
    titleNode = (
      <p className="text-sm text-neutral-800 leading-snug">
        <span className="font-semibold text-neutral-900">{p.sender_name || "User"}</span> messaged you about <span className="font-semibold text-neutral-900">{p.request_title || "a request"}</span>
      </p>
    );
    bubbleContent = p.message_snippet || null;
  } else if (notification.type === "winner" || notification.type === "winner_selected") {
    avatarFallback = "🏆";
    link = p.request_id ? createRequestUrl({ id: p.request_id }, searchParams) : null;
    titleNode = (
      <p className="text-sm text-neutral-800 leading-snug">
        <span className="font-semibold text-neutral-900">You won!</span> Your proposal was selected as the winner.
      </p>
    );
  }

  const NotificationCard = (
    <div
      className={cn(
        "flex flex-col px-6 py-4 transition-colors hover:bg-neutral-50 border-b border-neutral-100 last:border-0",
        !notification.read && "bg-[#7755FF]/[0.02]"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0 mt-0.5">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className={cn("bg-neutral-100 text-neutral-600", !avatarUrl && avatarFallback === "🏆" && "bg-[#FFDECA]/30 text-xl")}>
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col pt-1">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 pr-2">
              {titleNode}
              <p className="text-xs text-neutral-400 mt-1">{timeAgo}</p>
            </div>

            {/* Unread indicator dot on far right */}
            {!notification.read && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#7755FF] flex-shrink-0 mt-1.5" />
            )}
          </div>
          
          {/* Light Gray Bubble */}
          {bubbleContent && (
            <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm text-neutral-700">
              {bubbleContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} onClick={handleClick}>
        {NotificationCard}
      </a>
    );
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {NotificationCard}
    </div>
  );
}


"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/utils/time";
import { cn } from "@/lib/utils";
import { markNotificationReadAction } from "@/actions/notification.actions";
import { useRouter } from "next/navigation";
import { MessageSquare, Award, Bell } from "lucide-react";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    payload: any;
    read: boolean;
    created_at: string;
  };
}

function getNotificationContent(type: string, payload: any) {
  switch (type) {
    case "new_submission":
      return {
        icon: MessageSquare,
        title: "New proposal",
        message: `Someone submitted "${payload?.submission_title || "a proposal"}" to your request`,
        link: payload?.request_id ? `/app/requests/${payload.request_id}` : null,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    case "new_message":
      return {
        icon: MessageSquare,
        title: "New message",
        message: "You received a new private message",
        link: "/messages",
        color: "text-[#7755FF]",
        bgColor: "bg-[#7755FF]/10",
      };
    case "winner":
    case "winner_selected":
      return {
        icon: Award,
        title: "You won!",
        message: `Your proposal was selected as the winner`,
        link: payload?.request_id ? `/app/requests/${payload.request_id}` : null,
        color: "text-[#FF5F00]",
        bgColor: "bg-[#FFDECA]/20",
      };
    default:
      return {
        icon: Bell,
        title: type,
        message: "New activity",
        link: null,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const content = getNotificationContent(notification.type, notification.payload);
  const Icon = content.icon;
  const timeAgo = formatTimeAgo(notification.created_at);

  const handleClick = () => {
    // Mark as read if not already read
    if (!notification.read) {
      startTransition(async () => {
        await markNotificationReadAction(notification.id);
        router.refresh();
      });
    }
  };

  const NotificationCard = (
    <div
      className={cn(
        "flex flex-col p-4 transition-colors hover:bg-neutral-50 border-b border-neutral-100 last:border-0",
        !notification.read && "bg-[#7755FF]/[0.02]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Unread dot indicator matching the image */}
        <div className="pt-2.5 w-2 flex-shrink-0 flex justify-center">
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </div>
        
        {/* Icon / Avatar */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
            content.bgColor
          )}
        >
          <Icon className={cn("h-5 w-5", content.color)} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col pt-0.5">
          <div className="flex justify-between items-start gap-2 mb-1">
            <p className="text-sm font-semibold text-neutral-900 line-clamp-2 pr-2">
              {content.title}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-neutral-400 whitespace-nowrap">{timeAgo}</span>
            </div>
          </div>
          <p className="text-sm text-neutral-600 line-clamp-2">
            {content.message}
          </p>
        </div>
      </div>
    </div>
  );

  if (content.link) {
    return (
      <Link href={content.link} onClick={handleClick}>
        {NotificationCard}
      </Link>
    );
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {NotificationCard}
    </div>
  );
}


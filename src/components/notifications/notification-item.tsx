"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card
      className={cn(
        "border border-[#e5e7eb] bg-white transition-all hover:border-neutral-300",
        !notification.read && "border-l-4 border-l-[#7755FF]"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              content.bgColor
            )}
          >
            <Icon className={cn("h-5 w-5", content.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">
                  {content.title}
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  {content.message}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{timeAgo}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-[#7755FF] flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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


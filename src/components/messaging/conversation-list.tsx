"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils/time";
import type { Conversation, Profile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string | null) => void;
  currentUserId?: string;
}

export function ConversationList({ 
  conversations, 
  selectedId, 
  onSelect, 
  currentUserId 
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>
      <div className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <p className="text-sm">No conversations yet.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSeeker = conv.seeker_id === currentUserId;
            const otherUser = isSeeker ? conv.proposer : conv.seeker;
            const lastMessage = conv.last_message;
            const selected = selectedId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 text-left transition-colors border-b last:border-0",
                  selected ? "bg-[#7755FF]/5 border-l-4 border-l-[#7755FF]" : "hover:bg-neutral-50"
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={otherUser?.avatar_url || ""} />
                  <AvatarFallback className="bg-neutral-100 text-neutral-600">
                    {otherUser?.username?.substring(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-neutral-900 truncate">
                      {otherUser?.display_name || otherUser?.username || "Unknown"}
                    </span>
                    {conv.updated_at && (
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {formatTimeAgo(conv.updated_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#7755FF] truncate mb-1">
                    {conv.request?.title}
                  </p>
                  <p className="text-xs text-neutral-500 line-clamp-1">
                    {lastMessage?.content || "Start a conversation..."}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

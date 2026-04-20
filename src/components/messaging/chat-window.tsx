"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils/time";
import { formatFullName } from "@/lib/utils/name";
import type { Conversation, Message } from "@/lib/types";
import { MessageInput } from "./message-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sendMessageAction } from "@/actions/messaging.actions";
import { useRouter } from "next/navigation";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId?: string;
}

export function ChatWindow({ conversation, messages, currentUserId }: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50 text-neutral-400 p-8 text-center">
        <div>
          <p className="text-lg font-medium mb-1">Select a conversation</p>
          <p className="text-sm">Choose a chat from the left to start messaging.</p>
        </div>
      </div>
    );
  }

  const otherUser = conversation.seeker_id === currentUserId ? conversation.proposer : conversation.seeker;

  const handleSend = async (content: string) => {
    await sendMessageAction(conversation.id, content);
    router.refresh();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherUser?.avatar_url || ""} />
            <AvatarFallback className="bg-neutral-100 text-neutral-600">
              {(otherUser?.first_name?.charAt(0) || otherUser?.username?.charAt(0) || "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-900 truncate">
              {formatFullName(otherUser?.first_name, otherUser?.last_name, otherUser?.username)}
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
              Chatting about: <span className="text-[#7755FF]">{conversation.request?.title}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50"
      >
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[85%] sm:max-w-[70%]",
                isMe ? "mr-auto items-start" : "ml-auto items-end"
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm",
                  isMe 
                    ? "bg-[#7755FF] text-white rounded-tl-none" 
                    : "bg-white border border-neutral-200 text-neutral-900 rounded-tr-none shadow-sm"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 px-1">
                {formatTimeAgo(msg.created_at)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}

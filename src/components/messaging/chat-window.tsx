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
import { IconMessageCircle2 } from "@tabler/icons-react";
import Image from "next/image";

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId?: string;
  hasConversations?: boolean;
}

export function ChatWindow({ 
  conversation, 
  messages, 
  currentUserId,
  hasConversations = true 
}: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    if (!hasConversations) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
          <div className="relative mb-8 group">
            <div className="absolute -inset-4 bg-[#7755FF]/10 rounded-full blur-2xl group-hover:bg-[#7755FF]/20 transition-all duration-500" />
            <div className="relative h-40 w-40 flex items-center justify-center bg-white rounded-3xl shadow-2xl border border-neutral-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
               <div className="absolute -top-4 -right-4 h-12 w-12 bg-[#7755FF] rounded-xl flex items-center justify-center shadow-lg -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                 <IconMessageCircle2 size={24} className="text-white" />
               </div>
               <Image 
                 src="/logonseek.svg" 
                 alt="Onseek" 
                 width={60} 
                 height={60} 
                 className="opacity-20 grayscale"
               />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
            Your conversations will appear here
          </h2>
          <p className="text-neutral-500 max-w-xs mx-auto text-sm leading-relaxed">
            Once you receive a proposal or start a request, the magic happens in this space.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50/50 text-neutral-400 p-8 text-center">
        <div className="max-w-xs">
          <div className="mb-4 flex justify-center opacity-20">
             <IconMessageCircle2 size={48} strokeWidth={1.5} />
          </div>
          <p className="text-xl font-semibold text-neutral-900 mb-2">Select a conversation</p>
          <p className="text-sm text-neutral-500">Choose a chat from the left to start messaging about your requests and proposals.</p>
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

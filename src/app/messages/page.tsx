"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatWindow } from "@/components/messaging/chat-window";
import { getConversationsAction, getMessagesAction } from "@/actions/messaging.actions";
import { useAuth } from "@/components/layout/auth-provider";
import type { Conversation, Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchConversations = React.useCallback(async () => {
    const data = await getConversationsAction();
    setConversations(data);
    setIsLoading(false);
  }, []);

  const fetchMessages = React.useCallback(async (id: string) => {
    const data = await getMessagesAction(id);
    setMessages(data);
  }, []);

  React.useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  React.useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      const interval = setInterval(() => fetchMessages(selectedConvId), 5000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedConvId, fetchMessages]);

  const selectedConv = conversations.find(c => c.id === selectedConvId) || null;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <main className="flex-1 p-4 md:p-6 overflow-hidden max-w-[1400px] mx-auto w-full">
        <div className="h-full bg-white rounded-[32px] border border-neutral-200 overflow-hidden flex">
          {/* List - hidden on mobile if a conversation is selected */}
          <div className={cn(
            "w-full sm:w-[320px] md:w-[380px] shrink-0 h-full border-r border-neutral-100",
            selectedConvId ? "hidden sm:block" : "block"
          )}>
            <ConversationList 
              conversations={conversations} 
              selectedId={selectedConvId || undefined}
              onSelect={setSelectedConvId}
              currentUserId={user?.id}
            />
          </div>

          {/* Window - full screen on mobile if selected */}
          <div className={cn(
            "flex-1 h-full",
            selectedConvId ? "block" : "hidden sm:flex"
          )}>
            {selectedConvId && (
                <button 
                  onClick={() => setSelectedConvId(null)}
                  className="sm:hidden p-4 text-[#7755FF] font-medium flex items-center gap-1 border-b bg-white"
                >
                  ← Back to Inbox
                </button>
            )}
            <ChatWindow 
              conversation={selectedConv} 
              messages={messages}
              currentUserId={user?.id}
              hasConversations={conversations.length > 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

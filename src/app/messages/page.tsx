"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ConversationList } from "@/components/messaging/conversation-list";
import { ChatWindow } from "@/components/messaging/chat-window";
import { getConversationsAction, getMessagesAction } from "@/actions/messaging.actions";
import { useAuth } from "@/components/layout/auth-provider";
import type { Conversation, Message } from "@/lib/types";

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
    // Poll for new messages every 10 seconds for a basic non-realtime experience
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
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Simple Messages Navbar */}
      <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
        <Link href="/app" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="onseek"
            width={100}
            height={28}
            className="h-7 w-auto"
            priority
          />
          <span className="text-lg text-black font-semibold tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
            onseek
          </span>
        </Link>
        <Link 
          href="/app"
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors"
        >
          Return to app
        </Link>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* List - hidden on mobile if a conversation is selected */}
        <div className={cn(
          "w-full sm:w-[320px] md:w-[380px] shrink-0 h-full",
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
          />
        </div>
      </main>
    </div>
  );
}

// Helper function for class names
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

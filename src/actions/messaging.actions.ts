"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Conversation, Message } from "@/lib/types";

export async function createConversationAction(requestId: string, proposerId: string, content: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // 1. Check if conversation already exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("request_id", requestId)
    .eq("seeker_id", user.id)
    .eq("proposer_id", proposerId)
    .maybeSingle();

  let conversationId = existing?.id;

  if (!conversationId) {
    // 2. Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        request_id: requestId,
        seeker_id: user.id,
        proposer_id: proposerId
      })
      .select("id")
      .single();

    if (convError) return { error: convError.message };
    conversationId = newConv.id;
  }

  // 3. Send initial message
  const { error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    });

  // Notify the other participant
  if (!msgError) {
    // Fetch conversation participants
    const { data: conv } = await supabase
      .from("conversations")
      .select("seeker_id, proposer_id")
      .eq("id", conversationId)
      .single();
    
    if (conv) {
      const recipientId = user.id === conv.seeker_id ? conv.proposer_id : conv.seeker_id;
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "new_message",
        payload: { conversation_id: conversationId },
        read: false
      });
    }
  }

  if (msgError) return { error: msgError.message };

  revalidatePath("/messages");
  return { success: true, conversationId };
}

export async function sendMessageAction(conversationId: string, content: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });

  // Notify the other participant if message was saved
  if (!msgError) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("seeker_id, proposer_id")
      .eq("id", conversationId)
      .single();
    if (conv) {
      const recipientId = user.id === conv.seeker_id ? conv.proposer_id : conv.seeker_id;
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "new_message",
        payload: { conversation_id: conversationId },
        read: false,
      });
    }
  }


  revalidatePath("/messages");
  return { success: true };
}

export async function markAsReadAction(messageId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("id", messageId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getConversationsAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      request:requests(title),
      seeker:profiles!seeker_id(username, display_name, avatar_url),
      proposer:profiles!proposer_id(username, display_name, avatar_url),
      messages(content, created_at)
    `)
    .or(`seeker_id.eq.${user.id},proposer_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return (data as any[]).map((conv) => ({
    ...conv,
    last_message: conv.messages?.length > 0 
      ? conv.messages[conv.messages.length - 1] 
      : undefined
  })) as Conversation[];
}

export async function getMessagesAction(conversationId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data as Message[];
}

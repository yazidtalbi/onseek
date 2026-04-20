"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type FeedbackType = "bug" | "feedback";

export async function submitFeedbackAction(data: {
  type: FeedbackType;
  title: string;
  description: string;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // We'll store it even if no user is logged in, but we'll record if there is one
  const { error } = await supabase.from("feedback_reports").insert({
    user_id: user?.id || null,
    type: data.type,
    title: data.title,
    description: data.description,
  });

  if (error) {
    console.error("Error submitting feedback:", error);
    return { error: "Failed to submit feedback. Please try again." };
  }

  return { success: true };
}

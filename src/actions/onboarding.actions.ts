"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function completeOnboardingAction(data: {
  username: string;
  country: string;
  avatar_url?: string;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if username is already taken by someone else
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .neq("id", user.id)
    .maybeSingle();

  if (existingUser) {
    return { error: "Ce nom d'utilisateur est déjà pris." }; // Username taken (in French to match design)
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      username: data.username,
      country: data.country,
      avatar_url: data.avatar_url,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Update auth metadata
  await supabase.auth.updateUser({
    data: {
      username: data.username,
      avatar_url: data.avatar_url,
      onboarding_completed: true,
    },
  });

  revalidatePath("/", "layout"); // Revalidate entire app to remove onboarding block
  return { success: true };
}

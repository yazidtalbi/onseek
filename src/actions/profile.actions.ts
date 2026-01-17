"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators";

export async function updateProfileAction(formData: FormData) {
  const payload = {
    displayName: String(formData.get("displayName") || ""),
    username: String(formData.get("username") || ""),
    bio: String(formData.get("bio") || "") || null,
  };

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please check your profile details." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.displayName,
      bio: parsed.data.bio,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath(`/app/profile/${parsed.data.username}`);
  return { success: true };
}


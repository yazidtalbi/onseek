"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function toggleFavoriteAction(formData: FormData) {
  const requestId = String(formData.get("requestId") || "");
  
  if (!requestId) {
    return { error: "Missing request ID." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("request_id", requestId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("request_id", requestId)
      .eq("user_id", user.id);
    
    if (error) {
      return { error: error.message };
    }
    
    revalidatePath(`/app/requests/${requestId}`);
    revalidatePath("/");
    return { success: true, isFavorite: false };
  } else {
    // Add favorite
    const { error } = await supabase
      .from("favorites")
      .insert({
        request_id: requestId,
        user_id: user.id,
      });
    
    if (error) {
      return { error: error.message };
    }
    
    revalidatePath(`/app/requests/${requestId}`);
    revalidatePath("/");
    return { success: true, isFavorite: true };
  }
}


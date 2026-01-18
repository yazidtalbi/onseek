"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function voteAction(formData: FormData) {
  const submissionId = String(formData.get("submissionId") || "");
  const requestId = String(formData.get("requestId") || "");
  const vote = Number(formData.get("vote"));
  if (!submissionId || ![1, -1].includes(vote)) {
    return { error: "Invalid vote." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id, vote")
    .eq("submission_id", submissionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.vote === vote) {
      await supabase
        .from("votes")
        .delete()
        .eq("submission_id", submissionId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("votes")
        .update({ vote })
        .eq("submission_id", submissionId)
        .eq("user_id", user.id);
    }
  } else {
    await supabase.from("votes").insert({
      submission_id: submissionId,
      user_id: user.id,
      vote,
    });
  }

  if (requestId) {
    revalidatePath(`/app/requests/${requestId}`);
  }
  revalidatePath("/app/submissions");
  return { success: true };
}


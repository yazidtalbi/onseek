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

  const { data: submission } = await supabase
    .from("submissions")
    .select("user_id")
    .eq("id", submissionId)
    .single();

  const { data: ownerProfile } = submission
    ? await supabase
        .from("profiles")
        .select("reputation")
        .eq("id", submission.user_id)
        .single()
    : { data: null };

  let reputationDelta = 0;
  if (existing) {
    if (existing.vote === vote) {
      await supabase
        .from("votes")
        .delete()
        .eq("submission_id", submissionId)
        .eq("user_id", user.id);
      reputationDelta = -vote;
    } else {
      await supabase
        .from("votes")
        .update({ vote })
        .eq("submission_id", submissionId)
        .eq("user_id", user.id);
      reputationDelta = vote - existing.vote;
    }
  } else {
    await supabase.from("votes").insert({
      submission_id: submissionId,
      user_id: user.id,
      vote,
    });
    reputationDelta = vote;
  }

  if (submission?.user_id && typeof ownerProfile?.reputation === "number") {
    await supabase
      .from("profiles")
      .update({ reputation: ownerProfile.reputation + reputationDelta })
      .eq("id", submission.user_id);
  }

  if (requestId) {
    revalidatePath(`/app/requests/${requestId}`);
  }
  revalidatePath("/app/submissions");
  return { success: true };
}


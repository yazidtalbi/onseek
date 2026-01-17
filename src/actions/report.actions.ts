"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validators";

export async function createReportAction(formData: FormData) {
  const payload = {
    reason: String(formData.get("reason") || ""),
  };
  const type = String(formData.get("type") || "");
  const targetId = String(formData.get("targetId") || "");

  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success || !["request", "submission"].includes(type) || !targetId) {
    return { error: "Invalid report." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    type,
    target_id: targetId,
    reason: parsed.data.reason,
  });

  if (error) {
    return { error: error.message };
  }
  return { success: true };
}


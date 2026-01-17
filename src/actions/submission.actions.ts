"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { submissionSchema } from "@/lib/validators";

function parseStoreName(url: string, storeName?: string | null) {
  if (storeName?.trim()) return storeName.trim();
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

export async function createSubmissionAction(formData: FormData) {
  const requestId = String(formData.get("requestId") || "");
  const payload = {
    url: String(formData.get("url") || ""),
    storeName: String(formData.get("storeName") || "") || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    shippingCost: formData.get("shippingCost")
      ? Number(formData.get("shippingCost"))
      : null,
    notes: String(formData.get("notes") || "") || null,
  };

  if (!requestId) {
    return { error: "Missing request." };
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please provide a valid link and details." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: request } = await supabase
    .from("requests")
    .select("status")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "open") {
    return { error: "This request is closed." };
  }

  const { error } = await supabase.from("submissions").insert({
    request_id: requestId,
    user_id: user.id,
    url: parsed.data.url,
    store_name: parseStoreName(parsed.data.url, parsed.data.storeName),
    price: parsed.data.price ?? null,
    shipping_cost: parsed.data.shippingCost ?? null,
    notes: parsed.data.notes ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/app/requests/${requestId}`);
  revalidatePath("/app/submissions");
  revalidatePath("/app");
  return { success: true };
}


"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requestSchema } from "@/lib/validators";

function parseLinks(raw?: string | null) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      try {
        new URL(item);
        return true;
      } catch {
        return false;
      }
    });
}

export async function createRequestAction(formData: FormData) {
  const payload = {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category") || ""),
    budgetMin: formData.get("budgetMin")
      ? Number(formData.get("budgetMin"))
      : null,
    budgetMax: formData.get("budgetMax")
      ? Number(formData.get("budgetMax"))
      : null,
    priceLock: String(formData.get("priceLock") || "open") as "open" | "locked",
    exactItem: formData.get("exactItem") === "true",
    exactSpecification: formData.get("exactSpecification") === "true",
    exactPrice: formData.get("exactPrice") === "true",
    country: String(formData.get("country") || "") || null,
    condition: String(formData.get("condition") || "") || null,
    urgency: String(formData.get("urgency") || "") || null,
    referenceLinks: String(formData.get("referenceLinks") || ""),
  };

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please complete all required fields." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Parse preferences and dealbreakers from formData
  let preferencesList: Array<{ label: string; note?: string }> = [];
  let dealbreakersList: Array<{ label: string; note?: string }> = [];
  
  try {
    const prefsJson = formData.get("preferences");
    const dealbreakersJson = formData.get("dealbreakers");
    if (prefsJson && typeof prefsJson === "string") {
      preferencesList = JSON.parse(prefsJson);
    }
    if (dealbreakersJson && typeof dealbreakersJson === "string") {
      dealbreakersList = JSON.parse(dealbreakersJson);
    }
  } catch (e) {
    // Ignore parsing errors, use empty arrays
  }

  // Store preferences as JSON metadata (will be moved to separate columns later)
  const preferences = {
    priceLock: parsed.data.priceLock || "open",
    exactItem: parsed.data.exactItem || false,
    exactSpecification: parsed.data.exactSpecification || false,
    exactPrice: parsed.data.exactPrice || false,
    preferences: preferencesList,
    dealbreakers: dealbreakersList,
  };
  const preferencesJson = JSON.stringify(preferences);
  // Append preferences as hidden metadata to description
  const descriptionWithMetadata = `${parsed.data.description}\n\n<!--REQUEST_PREFS:${preferencesJson}-->`;

  const { data: request, error } = await supabase
    .from("requests")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      description: descriptionWithMetadata,
      category: parsed.data.category,
      budget_min: parsed.data.budgetMin,
      budget_max: parsed.data.budgetMax,
      country: parsed.data.country,
      condition: parsed.data.condition,
      urgency: parsed.data.urgency,
      status: "open",
    })
    .select()
    .single();

  if (error || !request) {
    return { error: error?.message || "Failed to create request." };
  }

  const links = parseLinks(parsed.data.referenceLinks);
  if (links.length) {
    await supabase.from("request_links").insert(
      links.map((url) => ({
        request_id: request.id,
        url,
      }))
    );
  }

  // Handle image URLs
  const imageUrls = formData.getAll("imageUrls") as string[];
  if (imageUrls.length > 0) {
    await supabase.from("request_images").insert(
      imageUrls.map((url, index) => ({
        request_id: request.id,
        image_url: url,
        image_order: index,
      }))
    );
  }

  revalidatePath("/app");
  revalidatePath("/app/requests");
  revalidatePath("/app/submissions");
  revalidatePath("/");
  redirect(`/app/requests/${request.id}`);
}

export async function updateRequestStatusAction(formData: FormData) {
  const requestId = String(formData.get("requestId") || "");
  const status = String(formData.get("status") || "");
  if (!requestId || !status) {
    return { error: "Invalid request." };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", requestId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/app/requests/${requestId}`);
  revalidatePath("/app");
  revalidatePath("/app/requests");
  revalidatePath("/app/submissions");
  return { success: true };
}

export async function markSolvedAction(formData: FormData) {
  const requestId = String(formData.get("requestId") || "");
  const submissionId = String(formData.get("submissionId") || "");
  if (!requestId || !submissionId) {
    return { error: "Invalid selection." };
  }
  const supabase = await createServerSupabaseClient();
  const { data: request } = await supabase
    .from("requests")
    .select("status, winner_submission_id")
    .eq("id", requestId)
    .single();
  if (!request || request.status === "solved") {
    return { error: "Request already solved." };
  }

  const { error } = await supabase
    .from("requests")
    .update({ status: "solved", winner_submission_id: submissionId })
    .eq("id", requestId);
  if (error) {
    return { error: error.message };
  }

  // Notify submission owner that they won - efficient single query
  const { data: submission } = await supabase
    .from("submissions")
    .select("user_id")
    .eq("id", submissionId)
    .single();
  
  if (submission?.user_id) {
    // Create notification in a single efficient operation
    await supabase.from("notifications").insert({
      user_id: submission.user_id,
      type: "winner_selected",
      payload: { request_id: requestId, submission_id: submissionId },
    });
  }

  revalidatePath(`/app/requests/${requestId}`);
  revalidatePath("/app");
  revalidatePath("/app/requests");
  revalidatePath("/app/submissions");
  return { success: true };
}


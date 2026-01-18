"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { submissionSchema } from "@/lib/validators";

function parseStoreName(url: string, articleName?: string | null) {
  if (articleName?.trim()) return articleName.trim();
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

function parseRequestPreferences(description: string) {
  const match = description.match(/<!--REQUEST_PREFS:({.*?})-->/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export async function createSubmissionAction(formData: FormData) {
  const requestId = String(formData.get("requestId") || "");
  const submissionType = String(formData.get("submissionType") || "link");
  
  const payload = {
    submissionType: submissionType as "link" | "personal",
    url: String(formData.get("url") || "") || null,
    articleName: String(formData.get("articleName") || "") || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    notes: String(formData.get("notes") || "") || null,
  };

  if (!requestId) {
    return { error: "Missing request." };
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Please provide valid details." };
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
    .select("status, description, budget_max")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "open") {
    return { error: "This request is closed." };
  }

  // Check if price is locked and validate price
  const preferences = parseRequestPreferences(request.description) || {
    priceLock: "open",
  };

  if (preferences.priceLock === "locked" && parsed.data.price && request.budget_max) {
    if (parsed.data.price > request.budget_max) {
      return { error: `Price cannot exceed ${request.budget_max}. The request has a locked budget.` };
    }
  }

  // For personal items, use a placeholder URL or store in notes
  let url = parsed.data.url;
  let storeName = parsed.data.articleName;
  
  if (submissionType === "personal") {
    url = "personal-item"; // Placeholder for personal items
    if (!storeName) {
      storeName = "Personal Item";
    }
  } else if (url) {
    storeName = parseStoreName(url, storeName);
  }

  // Add submission type info to notes
  let notes = parsed.data.notes || "";
  if (submissionType === "personal") {
    notes = `[Personal Item] ${notes}`;
  }

  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      request_id: requestId,
      user_id: user.id,
      url: url || "personal-item",
      store_name: storeName,
      price: parsed.data.price ?? null,
      shipping_cost: null,
      notes: notes.trim() || null,
    })
    .select("id")
    .single();

  if (error || !submission) {
    return { error: error?.message || "Failed to create submission." };
  }

  // Notify request owner of new submission - efficient single query
  // Get request owner in same query batch to minimize database calls
  const { data: requestOwner } = await supabase
    .from("requests")
    .select("user_id")
    .eq("id", requestId)
    .single();

  if (requestOwner?.user_id && requestOwner.user_id !== user.id) {
    // Create notification efficiently - single insert operation
    await supabase.from("notifications").insert({
      user_id: requestOwner.user_id,
      type: "new_submission",
      payload: { request_id: requestId, submission_id: submission.id },
    });
  }

  revalidatePath(`/app/requests/${requestId}`);
  revalidatePath("/app/submissions");
  revalidatePath("/app");
  return { success: true };
}


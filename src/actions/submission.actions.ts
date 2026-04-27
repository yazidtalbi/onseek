"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { submissionSchema } from "@/lib/validators";
import { sendProposalReceivedEmail } from "@/lib/emails";
import { createRequestUrl } from "@/lib/utils/slug";

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
    priceSuffix: String(formData.get("priceSuffix") || "") || null,
    category: String(formData.get("category") || "") || null,
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
  let imageUrl: string | null = null;
  
  if (submissionType === "personal") {
    url = "personal-item"; // Placeholder for personal items
    if (!storeName) {
      storeName = "Personal Item";
    }
    // Get image URL from formData for personal items
    const imageUrlString = String(formData.get("imageUrl") || "");
    if (imageUrlString) {
      imageUrl = imageUrlString;
    }
  } else if (url) {
    storeName = parseStoreName(url, storeName);
  }

  // Notes
  let notes = parsed.data.notes || "";

  const insertData: any = {
    request_id: requestId,
    user_id: user.id,
    url: url || "personal-item",
    article_name: storeName,
    price: parsed.data.price ?? null,
    price_suffix: parsed.data.priceSuffix || null,
    category: parsed.data.category || null,
    shipping_cost: null,
    notes: notes.trim() || null,
    image_url: imageUrl,
  };

  let { data: submission, error } = await supabase
    .from("submissions")
    .insert(insertData)
    .select("id")
    .single();

  // Handle case where new columns might not exist yet (migration pending)
  if (error?.message?.includes("column \"category\"") || 
      error?.message?.includes("'category' column") ||
      error?.message?.includes("column \"price_suffix\"") ||
      error?.message?.includes("'price_suffix' column")) {
    const { category, price_suffix, ...insertDataFallback } = insertData;
    const { data: retrySubmission, error: retryError } = await supabase
      .from("submissions")
      .insert(insertDataFallback)
      .select("id")
      .single();
    
    submission = retrySubmission;
    error = retryError;
  }

  if (error || !submission) {
    return { error: error?.message || "Failed to create submission." };
  }

  // Notification is now handled automatically by database trigger (more efficient)
  // No need to manually create notification here

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/submissions");
  revalidatePath("/");

  // Fetch request owner's email to send "Proposal Received" notification
  try {
    const { data: requestOwner } = await supabase
      .from("requests")
      .select("id, title, slug, user_id, profiles(contact_email, email, username)")
      .eq("id", requestId)
      .single();

    const ownerEmail = (requestOwner?.profiles as any)?.contact_email || (requestOwner?.profiles as any)?.email;
    
    if (ownerEmail && requestOwner) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://onseek.co";
      const requestUrl = `${baseUrl}${createRequestUrl(requestOwner)}`;
      
      await sendProposalReceivedEmail(ownerEmail, {
        title: requestOwner.title,
        price: parsed.data.price ? `$${parsed.data.price}` : "Contact for price",
        url: requestUrl,
      });
    }
  } catch (emailError) {
    console.error("Failed to send proposal notification email:", emailError);
    // Don't fail the submission if email fails
  }

  return { success: true };
}


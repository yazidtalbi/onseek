"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requestSchema } from "@/lib/validators";
import { createRequestUrl, generateSlug } from "@/lib/utils/slug";

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
    budgetMin: null,
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
    // Log validation errors to console
    console.error("Request validation failed:", parsed.error.issues);
    console.error("Payload received:", payload);
    
    // Return specific field errors
    const errors = parsed.error.issues.map((err) => {
      const field = err.path[0] as string;
      return `${field}: ${err.message}`;
    });
    
    const fieldErrors = parsed.error.issues.reduce((acc, err) => {
      const field = err.path[0] as string;
      acc[field] = err.message;
      return acc;
    }, {} as Record<string, string>);
    
    console.error("Formatted field errors:", fieldErrors);
    
    return { 
      error: errors.length > 0 
        ? errors.join(". ") 
        : "Please complete all required fields.",
      fieldErrors
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Fetch user's country from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("country")
    .eq("id", user.id)
    .single();

  const userCountry = profile?.country || null;

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

  console.log("=== Server Action Debug ===");
  console.log("Parsed data:", JSON.stringify(parsed.data, null, 2));
  console.log("Description with metadata length:", descriptionWithMetadata.length);
  console.log("Description preview:", descriptionWithMetadata.substring(0, 200));
  console.log("User ID:", user.id);
  console.log("User Country from Profile:", userCountry);
  
  // Generate a unique slug based on title
  const baseSlug = generateSlug(parsed.data.title);
  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;
  
  while (!isUnique) {
    const { data } = await supabase
      .from("requests")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
      
    if (!data) {
      isUnique = true;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  
  const insertData = {
    user_id: user.id,
    title: parsed.data.title,
    slug,
    description: descriptionWithMetadata,
    category: parsed.data.category,
    budget_min: parsed.data.budgetMin,
    budget_max: parsed.data.budgetMax,
    country: parsed.data.country || userCountry,
    condition: parsed.data.condition,
    urgency: parsed.data.urgency,
    status: "pending" as const,
  };
  
  console.log("Insert data:", JSON.stringify(insertData, null, 2));
  
  const { data: request, error } = await supabase
    .from("requests")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Database insert error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Error details:", error.details);
    console.error("Error hint:", error.hint);
    return { error: error.message || "Failed to create request." };
  }
  
  if (!request) {
    console.error("No request returned from insert, but no error either");
    return { error: "Failed to create request - no data returned." };
  }
  
  console.log("Request created successfully! ID:", request.id);

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

  revalidatePath("/");
  revalidatePath("/requests");
  revalidatePath("/submissions");
  revalidatePath("/");
  
  const url = createRequestUrl(request.slug);
  return { success: true, url };
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
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/");
  revalidatePath("/requests");
  revalidatePath("/submissions");
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
    .select("status, winner_submission_id, user_id")
    .eq("id", requestId)
    .single();
  
  if (!request || request.status === "solved") {
    return { error: "Request already solved." };
  }

  // Only owner can mark as solved
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id !== request.user_id) {
    return { error: "Unauthorized" };
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

  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/");
  revalidatePath("/requests");
  revalidatePath("/submissions");
  return { success: true };
}

export async function approveRequestAction(requestId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Admin only action" };

  const { error } = await supabase
    .from("requests")
    .update({ status: "open" })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  return { success: true };
}

export async function rejectRequestAction(requestId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Admin only action" };

  const { error } = await supabase
    .from("requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  return { success: true };
}

export async function archiveRequestAction(requestId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Unauthorized" };

  const { data: request } = await supabase
    .from("requests")
    .select("user_id")
    .eq("id", requestId)
    .single();

  if (!request || request.user_id !== user.id) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("requests")
    .update({ status: "archived" })
    .eq("id", requestId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
  return { success: true };
}


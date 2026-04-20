"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { profileSchema, contactInfoSchema } from "@/lib/validators";

export async function updateProfileAction(formData: FormData) {
  // Extract all possible fields
  const rawPayload: any = {
    username: String(formData.get("username") || ""),
    bio: formData.has("bio") ? String(formData.get("bio") || "") || null : undefined,
    country: formData.has("country") ? String(formData.get("country") || "") || null : undefined,
    avatar_url: formData.has("avatarUrl") ? String(formData.get("avatarUrl") || "") || null : undefined,
    first_name: formData.has("first_name") ? String(formData.get("first_name") || "") || null : undefined,
    last_name: formData.has("last_name") ? String(formData.get("last_name") || "") || null : undefined,
  };

  // Filter out undefined fields for validation and update
  const payload: any = { username: rawPayload.username };
  if (rawPayload.bio !== undefined) payload.bio = rawPayload.bio;
  if (rawPayload.country !== undefined) payload.country = rawPayload.country;
  if (rawPayload.avatar_url !== undefined) payload.avatar_url = rawPayload.avatar_url;
  if (rawPayload.first_name !== undefined) payload.first_name = rawPayload.first_name;
  if (rawPayload.last_name !== undefined) payload.last_name = rawPayload.last_name;

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

  // Update only the provided fields
  const updateData: any = {
    username: parsed.data.username,
  };
  if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
  if (parsed.data.country !== undefined) updateData.country = parsed.data.country;
  if (parsed.data.avatar_url !== undefined) updateData.avatar_url = parsed.data.avatar_url;
  if (parsed.data.first_name !== undefined) updateData.first_name = parsed.data.first_name;
  if (parsed.data.last_name !== undefined) updateData.last_name = parsed.data.last_name;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath(`/profile/${parsed.data.username}`);
  return { success: true };
}

export async function updateContactInfoAction(formData: FormData) {
  const contactEmail = String(formData.get("contactEmail") || "").trim();
  const contactPhone = String(formData.get("contactPhone") || "").trim();
  const contactWhatsapp = String(formData.get("contactWhatsapp") || "").trim();
  const contactTelegram = String(formData.get("contactTelegram") || "").trim();
  const contactPreferred = String(formData.get("contactPreferred") || "").trim();

  const payload = {
    contactEmail: contactEmail || null,
    contactPhone: contactPhone || null,
    contactWhatsapp: contactWhatsapp || null,
    contactTelegram: contactTelegram || null,
    contactPreferred: contactPreferred || null,
  };

  const parsed = contactInfoSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please check your contact information." };
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
      contact_email: parsed.data.contactEmail || null,
      contact_phone: parsed.data.contactPhone || null,
      contact_whatsapp: parsed.data.contactWhatsapp || null,
      contact_telegram: parsed.data.contactTelegram || null,
      contact_preferred: parsed.data.contactPreferred || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}


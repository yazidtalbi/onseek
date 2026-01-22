"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { profileSchema, contactInfoSchema } from "@/lib/validators";

export async function updateProfileAction(formData: FormData) {
  const payload = {
    username: String(formData.get("username") || ""),
    bio: String(formData.get("bio") || "") || null,
  };

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

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      bio: parsed.data.bio,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app/settings");
  revalidatePath(`/app/profile/${parsed.data.username}`);
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

  revalidatePath("/app/settings");
  return { success: true };
}


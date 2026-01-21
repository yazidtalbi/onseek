"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function savePersonalItemAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const articleName = String(formData.get("articleName") || "");
  const description = String(formData.get("description") || "") || null;
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const imageUrl = String(formData.get("imageUrl") || "") || null;

  if (!articleName || articleName.trim() === "") {
    return { error: "Article name is required" };
  }

  const { data, error } = await supabase
    .from("saved_personal_items")
    .insert({
      user_id: user.id,
      article_name: articleName.trim(),
      description: description?.trim() || null,
      price: price,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving personal item:", error);
    return { error: "Failed to save item" };
  }

  return { data };
}

export async function getSavedPersonalItemsAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized", data: [] };
  }

  const { data, error } = await supabase
    .from("saved_personal_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved personal items:", error);
    return { error: "Failed to fetch saved items", data: [] };
  }

  return { data: data || [] };
}

export async function deleteSavedPersonalItemAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const itemId = String(formData.get("itemId") || "");
  if (!itemId) {
    return { error: "Item ID is required" };
  }

  const { error } = await supabase
    .from("saved_personal_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting saved personal item:", error);
    return { error: "Failed to delete item" };
  }

  return { success: true };
}


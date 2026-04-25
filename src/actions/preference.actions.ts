"use server";

import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Category, UserPreference, FeedMode, PersonalizedFeedResponse } from "@/lib/types";

/**
 * Save user category preferences
 */
export async function savePreferencesAction(categoryIds: string[]) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Validate category IDs exist
  if (categoryIds.length > 0) {
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id")
      .in("id", categoryIds);

    if (catError || !categories || categories.length !== categoryIds.length) {
      return { error: "Invalid category IDs" };
    }
  }

  // Delete existing preferences
  const { error: deleteError } = await supabase
    .from("user_preferences")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    console.error("Error deleting preferences:", deleteError);
    return { error: "Failed to update preferences" };
  }

  // Insert new preferences with default weight of 1.0
  if (categoryIds.length > 0) {
    const preferences = categoryIds.map((categoryId) => ({
      user_id: user.id,
      category_id: categoryId,
      weight: 1.0,
    }));

    const { error: insertError } = await supabase
      .from("user_preferences")
      .insert(preferences);

    if (insertError) {
      console.error("Error inserting preferences:", insertError);
      return { error: "Failed to save preferences" };
    }
  }

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

/**
 * Hide a category for the user
 */
export async function hideCategoryAction(categoryId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Validate category exists
  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .single();

  if (catError || !category) {
    return { error: "Invalid category" };
  }

  // Insert or ignore if already exists
  const { error } = await supabase
    .from("user_hidden_categories")
    .insert({
      user_id: user.id,
      category_id: categoryId,
    })
    .select()
    .single();

  if (error && error.code !== "23505") {
    // 23505 is unique violation, which is fine
    console.error("Error hiding category:", error);
    return { error: "Failed to hide category" };
  }

  // Also remove from preferences if it exists
  await supabase
    .from("user_preferences")
    .delete()
    .eq("user_id", user.id)
    .eq("category_id", categoryId);

  revalidatePath("/");
  return { success: true };
}

/**
 * Get user's category preferences
 */
export async function getUserPreferencesAction(): Promise<{
  preferences: UserPreference[];
  hiddenCategories: string[];
} | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const [prefsResult, hiddenResult] = await Promise.all([
    supabase
      .from("user_preferences")
      .select("*, category:categories(*)")
      .eq("user_id", user.id),
    supabase
      .from("user_hidden_categories")
      .select("category_id")
      .eq("user_id", user.id),
  ]);

  if (prefsResult.error || hiddenResult.error) {
    return { error: "Failed to fetch preferences" };
  }

  return {
    preferences: (prefsResult.data || []) as UserPreference[],
    hiddenCategories: (hiddenResult.data || []).map((h) => h.category_id),
  };
}

/**
 * Get all available categories
 */
export async function getCategoriesAction(): Promise<Category[] | { error: string }> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return { error: "Failed to fetch categories" };
  }

  return (data || []) as Category[];
}

/**
 * Get personalized feed with ranking
 */
type FeedFilters = {
  category?: string | null;
  priceMin?: string | null;
  priceMax?: string | null;
  country?: string | null;
  sort?: string | null;
  tagSlug?: string | null;
};

export async function getPersonalizedFeedAction(
  mode: FeedMode = "for_you",
  cursor?: string,
  limit: number = 20,
  filters: FeedFilters = {}
): Promise<PersonalizedFeedResponse | { error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user preferences and hidden categories
  let preferences: Array<{ category_id: string; weight: number }> = [];
  let hiddenCategoryIds: string[] = [];
  
  if (user) {
    try {
      const [prefsResult, hiddenResult] = await Promise.all([
        supabase
          .from("user_preferences")
          .select("category_id, weight")
          .eq("user_id", user.id),
        supabase
          .from("user_hidden_categories")
          .select("category_id")
          .eq("user_id", user.id),
      ]);

      preferences = prefsResult.data || [];
      hiddenCategoryIds = (hiddenResult.data || []).map((h) => h.category_id);
    } catch (err) {
      console.warn("Could not fetch preferences:", err);
    }
  }

  const hasPreferences = preferences.length > 0;
  const effectiveMode = !user || (mode === "for_you" && !hasPreferences) ? "latest" : mode;

  let query = supabase
    .from("requests")
    .select("*, profiles(username, avatar_url, first_name, last_name)");

  try {
    if (filters.tagSlug) {
      const adminSupabase = await createAdminSupabaseClient();
      const { data: tag } = await adminSupabase
        .from("tags")
        .select("id")
        .eq("slug", filters.tagSlug)
        .single();
      
      if (!tag) {
        return { items: [], nextCursor: null, hasMore: false };
      }

      const { data: rt } = await adminSupabase
        .from("request_tags")
        .select("request_id")
        .eq("tag_id", tag.id);
      
      const ids = rt?.map(r => r.request_id) || [];
      if (ids.length === 0) {
        return { items: [], nextCursor: null, hasMore: false };
      }
      query = query.in("id", ids);
    }

    if (user) {
      query = query.or(`status.eq.open,and(status.eq.pending,user_id.eq.${user.id})`);
    } else {
      query = query.eq("status", "open");
    }
  } catch (err) {
    console.error("[getPersonalizedFeedAction] Query setup error:", err);
    return { items: [], nextCursor: null, hasMore: false };
  }

  // Apply filters
  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }
  if (filters.country) {
    query = query.ilike("country", `%${filters.country}%`);
  }
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin ? parseFloat(filters.priceMin) : null;
    const max = filters.priceMax ? parseFloat(filters.priceMax) : null;
    if (min !== null && !isNaN(min)) {
      query = query.or(`budget_max.gte.${min},budget_max.is.null`);
    }
    if (max !== null && !isNaN(max)) {
      query = query.or(`budget_min.lte.${max},budget_min.is.null`);
    }
  }

  const sortMode = filters.sort || (effectiveMode === "latest" ? "newest" : effectiveMode === "trending" ? "active" : "newest");
  if (sortMode === "active") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Cursor-based pagination
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: requests, error } = await query.limit(limit + 1);

  if (error) {
    console.error("[getPersonalizedFeedAction] Error fetching personalized feed:", error);
    return { error: `Failed to fetch feed: ${error.message}` };
  }

  const hasMore = (requests?.length || 0) > limit;
  const items = (requests || []).slice(0, limit);

  if (items.length === 0) {
    return { items: [], nextCursor: null, hasMore: false };
  }

  const requestIds = items.map((r: any) => r.id);
  
  // Fetch images, links, tags, and submission counts in parallel
  const [imagesResult, linksResult, tagsResult, submissionsResult] = await Promise.all([
    supabase
      .from("request_images")
      .select("request_id, image_url, image_order")
      .in("request_id", requestIds)
      .order("image_order", { ascending: true }),
    supabase
      .from("request_links")
      .select("request_id, url")
      .in("request_id", requestIds),
    supabase
      .from("request_tags")
      .select("request_id, tags(*)")
      .in("request_id", requestIds),
    supabase
      .from("submissions")
      .select("request_id")
      .in("request_id", requestIds),
  ]);

  const imageMap = new Map<string, string[]>();
  (imagesResult.data || []).forEach((img: any) => {
    const existing = imageMap.get(img.request_id) || [];
    if (existing.length < 3) {
      existing.push(img.image_url);
      imageMap.set(img.request_id, existing);
    }
  });

  const linkMap = new Map<string, string[]>();
  (linksResult.data || []).forEach((link: any) => {
    const existing = linkMap.get(link.request_id) || [];
    existing.push(link.url);
    linkMap.set(link.request_id, existing);
  });

  const tagMap = new Map<string, any[]>();
  (tagsResult.data || []).forEach((rt: any) => {
    if (rt.tags) {
      const existing = tagMap.get(rt.request_id) || [];
      existing.push(rt.tags);
      tagMap.set(rt.request_id, existing);
    }
  });

  const submissionCountMap = new Map<string, number>();
  (submissionsResult.data || []).forEach((sub: any) => {
    const current = submissionCountMap.get(sub.request_id) || 0;
    submissionCountMap.set(sub.request_id, current + 1);
  });

  let processedItems = items.map((req: any) => ({
    ...req,
    images: imageMap.get(req.id) || [],
    links: linkMap.get(req.id) || [],
    tags: tagMap.get(req.id) || [],
    submissionCount: submissionCountMap.get(req.id) || 0,
  }));

  // Apply personalization ranking if needed
  if (effectiveMode === "for_you" && hasPreferences) {
    processedItems = rankPersonalizedFeed(processedItems, preferences, hiddenCategoryIds);
  } else if (effectiveMode === "trending") {
    processedItems = rankTrendingFeed(processedItems);
  }

  const nextCursor = processedItems.length > 0 ? processedItems[processedItems.length - 1].created_at : null;

  return {
    items: processedItems,
    nextCursor,
    hasMore,
  };
}

/**
 * Rank requests for personalized feed
 */
function rankPersonalizedFeed(
  items: any[],
  preferences: Array<{ category_id: string; weight: number }>,
  hiddenCategoryIds: string[]
): any[] {
  const preferenceMap = new Map(preferences.map((p) => [p.category_id, p.weight]));
  const scored = items.map((req) => {
    const categories = req.categories || [];
    let categoryScore = 0;
    categories.forEach((cat: any) => {
      if (cat && preferenceMap.has(cat.id)) {
        categoryScore += preferenceMap.get(cat.id) || 1;
      }
    });
    const now = Date.now();
    const created = new Date(req.created_at).getTime();
    const recencyScore = Math.max(0, 1 - (now - created) / (1000 * 60 * 60 * 24 * 7));
    const totalScore = categoryScore * 0.6 + recencyScore * 0.4;
    return { ...req, personalizationScore: totalScore };
  });
  scored.sort((a, b) => (b.personalizationScore || 0) - (a.personalizationScore || 0));
  return scored;
}

/**
 * Rank requests for trending feed
 */
function rankTrendingFeed(items: any[]): any[] {
  return items.map((req) => {
    const now = Date.now();
    const created = new Date(req.created_at).getTime();
    const recencyDecay = Math.max(0, 1 - (now - created) / (1000 * 60 * 60 * 24 * 3));
    const trendingScore = (req.submissionCount || 0) * recencyDecay;
    return { ...req, personalizationScore: trendingScore };
  }).sort((a, b) => (b.personalizationScore || 0) - (a.personalizationScore || 0));
}

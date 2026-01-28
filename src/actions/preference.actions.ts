"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
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

  revalidatePath("/app");
  revalidatePath("/app/settings");
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

  revalidatePath("/app");
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

  // Get user preferences and hidden categories (handle if tables don't exist or user is not authenticated)
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
      // If tables don't exist yet (migrations not run), continue without preferences
      console.warn("Could not fetch preferences (tables may not exist):", err);
    }
  }

  const hasPreferences = preferences.length > 0;

  // If no user, no preferences, or mode is "for_you" without preferences, fall back to "latest"
  const effectiveMode = !user || (mode === "for_you" && !hasPreferences) ? "latest" : mode;

  // Simple query - just get requests
  let query = supabase
    .from("requests")
    .select("*")
    .eq("status", "open");

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

  // Note: We'll filter out hidden categories in the application layer
  // Supabase doesn't easily support NOT IN with subqueries in this way

  // Apply sort
  const sortMode = filters.sort || (effectiveMode === "latest" ? "newest" : effectiveMode === "trending" ? "active" : "newest");
  
  if (sortMode === "active") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (effectiveMode === "for_you" && hasPreferences) {
    // Personalized ranking with 80/20 serendipity
    const preferenceWeights = preferences.reduce(
      (acc, p) => {
        acc[p.category_id] = p.weight;
        return acc;
      },
      {} as Record<string, number>
    );

    // This is complex - we'll use a CTE approach
    // For now, we'll fetch and rank in the application layer
    // In production, you'd want a database function or materialized view
    query = query.order("created_at", { ascending: false });
  }

  // Cursor-based pagination
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: requests, error } = await query.limit(limit + 1);

  if (error) {
    console.error("[getPersonalizedFeedAction] Error fetching personalized feed:", error);
    console.error("[getPersonalizedFeedAction] Error details:", JSON.stringify(error, null, 2));
    return { error: `Failed to fetch feed: ${error.message || "Unknown error"}` };
  }

  console.log(`[getPersonalizedFeedAction] Found ${requests?.length || 0} requests with status='open'`);
  
  // If no requests found, log for debugging
  if (!requests || requests.length === 0) {
    console.warn("[getPersonalizedFeedAction] No requests found. Checking if there are any requests in the database...");
    const { data: allRequests, error: checkError } = await supabase
      .from("requests")
      .select("id, status, created_at")
      .limit(5);
    
    if (checkError) {
      console.error("[getPersonalizedFeedAction] Error checking requests:", checkError);
    } else {
      console.log(`[getPersonalizedFeedAction] Total requests in DB (sample):`, allRequests?.length || 0);
      console.log(`[getPersonalizedFeedAction] Sample request statuses:`, allRequests?.map(r => ({ id: r.id, status: r.status })));
    }
  }

  const hasMore = (requests?.length || 0) > limit;
  const items = (requests || []).slice(0, limit);

  if (items.length === 0) {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  // Get submission counts separately
  const requestIds = items.map((r: any) => r.id);
  let submissionCounts: Record<string, number> = {};
  
  if (requestIds.length > 0) {
    const { data: counts } = await supabase
      .from("submissions")
      .select("request_id")
      .in("request_id", requestIds);
    
    counts?.forEach((sub: any) => {
      submissionCounts[sub.request_id] = (submissionCounts[sub.request_id] || 0) + 1;
    });
  }

  // Get categories separately (more reliable than nested select)
  let categoriesMap: Record<string, any[]> = {};
  try {
    const { data: requestCategories } = await supabase
      .from("request_categories")
      .select("request_id, category:categories(*)")
      .in("request_id", requestIds);
    
    if (requestCategories) {
      requestCategories.forEach((rc: any) => {
        if (rc.category && rc.request_id) {
          if (!categoriesMap[rc.request_id]) {
            categoriesMap[rc.request_id] = [];
          }
          categoriesMap[rc.request_id].push(rc.category);
        }
      });
    }
  } catch (err) {
    // If categories table doesn't exist or query fails, continue without categories
    console.warn("Could not fetch categories (table may not exist):", err);
  }

  // Process items: attach categories, calculate scores, apply 80/20 mix
  let processedItems = items.map((req: any) => {
    const categories = categoriesMap[req.id] || [];
    const submissionCount = submissionCounts[req.id] || 0;

    // Filter out requests that only have hidden categories
    const hasNonHiddenCategory = categories.some(
      (cat: any) => cat && !hiddenCategoryIds.includes(cat.id)
    );

    return {
      ...req,
      categories,
      submissionCount,
      _hasNonHiddenCategory: hasNonHiddenCategory,
    };
  }).filter((req: any) => {
    // Filter out requests that only have hidden categories
    if (hiddenCategoryIds.length > 0 && req.categories.length > 0) {
      return req._hasNonHiddenCategory;
    }
    return true;
  });

  // Apply personalization ranking if mode is "for_you"
  if (effectiveMode === "for_you" && hasPreferences) {
    processedItems = rankPersonalizedFeed(
      processedItems,
      preferences,
      hiddenCategoryIds
    );
  } else if (effectiveMode === "trending") {
    processedItems = rankTrendingFeed(processedItems);
  }

  // Get images and links for requests
  if (processedItems.length > 0) {
    const processedRequestIds = processedItems.map((r: any) => r.id);
    const [imagesResult, linksResult] = await Promise.all([
      supabase
        .from("request_images")
        .select("request_id, image_url, image_order")
        .in("request_id", processedRequestIds)
        .order("image_order", { ascending: true }),
      supabase
        .from("request_links")
        .select("request_id, url")
        .in("request_id", processedRequestIds),
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

    processedItems = processedItems.map((req: any) => {
      const { _hasNonHiddenCategory, ...rest } = req;
      return {
        ...rest,
        images: imageMap.get(req.id) || [],
        links: linkMap.get(req.id) || [],
      };
    });
  }

  const nextCursor =
    processedItems.length > 0
      ? processedItems[processedItems.length - 1].created_at
      : null;

  return {
    items: processedItems,
    nextCursor,
    hasMore,
  };
}

/**
 * Rank requests for personalized feed
 * Implements 80% matched + 20% serendipity
 */
function rankPersonalizedFeed(
  items: any[],
  preferences: Array<{ category_id: string; weight: number }>,
  hiddenCategoryIds: string[]
): any[] {
  const preferenceMap = new Map(
    preferences.map((p) => [p.category_id, p.weight])
  );

  // Calculate scores for each request
  const scored = items.map((req) => {
    const categories = req.categories || [];
    let categoryScore = 0;
    const matchedCategories: any[] = [];

    categories.forEach((cat: any) => {
      if (cat && preferenceMap.has(cat.id)) {
        const weight = preferenceMap.get(cat.id) || 1;
        categoryScore += weight;
        matchedCategories.push(cat);
      }
    });

    // Recency score (newer = higher, normalized to 0-1)
    const now = Date.now();
    const created = new Date(req.created_at).getTime();
    const ageInHours = (now - created) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageInHours / (24 * 7)); // Decay over 7 days

    // Activity score (submission count, normalized)
    const activityScore = Math.min(1, (req.submissionCount || 0) / 10);

    // Combined score
    const totalScore =
      categoryScore * 0.6 + recencyScore * 0.2 + activityScore * 0.2;

    return {
      ...req,
      personalizationScore: totalScore,
      matchedCategories,
      matchReason:
        matchedCategories.length > 0
          ? `Because you follow: ${matchedCategories.map((c) => c.name).join(", ")}`
          : undefined,
    };
  });

  // Sort by score
  scored.sort((a, b) => (b.personalizationScore || 0) - (a.personalizationScore || 0));

  // 80/20 split: top 80% by score, 20% latest (serendipity)
  const matchedCount = Math.floor(scored.length * 0.8);
  const matched = scored.slice(0, matchedCount);
  const serendipity = scored.slice(matchedCount);

  // Sort serendipity by recency
  serendipity.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Interleave: take from matched, occasionally from serendipity
  const result: any[] = [];
  let matchedIdx = 0;
  let serendipityIdx = 0;

  for (let i = 0; i < scored.length; i++) {
    // Every 5th item is serendipity (20%)
    if (i % 5 === 4 && serendipityIdx < serendipity.length) {
      result.push(serendipity[serendipityIdx++]);
    } else if (matchedIdx < matched.length) {
      result.push(matched[matchedIdx++]);
    } else if (serendipityIdx < serendipity.length) {
      result.push(serendipity[serendipityIdx++]);
    }
  }

  return result;
}

/**
 * Rank requests for trending feed
 */
function rankTrendingFeed(items: any[]): any[] {
  return items
    .map((req) => {
      const now = Date.now();
      const created = new Date(req.created_at).getTime();
      const ageInHours = (now - created) / (1000 * 60 * 60);
      const recencyDecay = Math.max(0, 1 - ageInHours / (24 * 3)); // Decay over 3 days
      const activityScore = Math.min(10, req.submissionCount || 0);
      const trendingScore = activityScore * recencyDecay;

      return {
        ...req,
        personalizationScore: trendingScore,
      };
    })
    .sort((a, b) => (b.personalizationScore || 0) - (a.personalizationScore || 0));
}


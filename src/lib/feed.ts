import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FeedMode } from "@/lib/types";

export type FeedFilters = {
  category?: string | null;
  priceMin?: string | null;
  priceMax?: string | null;
  country?: string | null;
  sort?: string | null;
};

export async function fetchInitialFeedData(
  mode: FeedMode,
  filters: FeedFilters
) {
  const supabase = await createServerSupabaseClient();
  const limit = 20;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  let query = supabase
    .from("requests")
    .select("*, profiles(username)");

  if (user) {
    query = query.or(`status.eq.open,and(status.eq.pending,user_id.eq.${user.id})`);
  } else {
    query = query.eq("status", "open");
  }
  
  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }
  let defaultCountry = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("country").eq("id", user.id).single();
    if (profile?.country) defaultCountry = profile.country;
  }
  
  const countryToSearch = filters.country !== undefined ? filters.country : defaultCountry;

  if (countryToSearch && countryToSearch !== "All") {
    query = query.ilike("country", `%${countryToSearch}%`);
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
  
  const sortMode = filters.sort || (mode === "latest" ? "newest" : mode === "trending" ? "active" : "newest");
  if (sortMode === "active") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  
  const { data: requests } = await query.limit(limit);
  
  if (!requests || requests.length === 0) {
    return { items: [], nextCursor: null };
  }
  
  const requestIds = requests.map((r: any) => r.id);
  const nextCursor = requests.length === limit ? requests[requests.length - 1].created_at : null;
  
  // Fetch images, links, and submission counts in parallel
  const [imagesResult, linksResult, submissionCountsResult] = await Promise.all([
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
      .from("submissions")
      .select("request_id")
      .in("request_id", requestIds),
  ]);
  
  const imageMap = new Map<string, string[]>();
  imagesResult.data?.forEach((img) => {
    const existing = imageMap.get(img.request_id) || [];
    if (existing.length < 3) {
      existing.push(img.image_url);
      imageMap.set(img.request_id, existing);
    }
  });
  
  const linkMap = new Map<string, string[]>();
  linksResult.data?.forEach((link) => {
    const existing = linkMap.get(link.request_id) || [];
    existing.push(link.url);
    linkMap.set(link.request_id, existing);
  });
  
  const submissionCountMap = new Map<string, number>();
  submissionCountsResult.data?.forEach((sub) => {
    const current = submissionCountMap.get(sub.request_id) || 0;
    submissionCountMap.set(sub.request_id, current + 1);
  });
  
  const items = requests.map((req: any) => ({
    ...req,
    images: imageMap.get(req.id) || [],
    links: linkMap.get(req.id) || [],
    submissionCount: submissionCountMap.get(req.id) || 0,
  }));
  
  return {
    items,
    nextCursor,
  };
}

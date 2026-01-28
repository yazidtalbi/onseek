import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { PromotionalSidebar } from "@/components/requests/promotional-sidebar";
import type { FeedMode } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  mode?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  country?: string;
  sort?: string;
};

async function fetchInitialFeedData(
  mode: FeedMode,
  filters: { category?: string | null; priceMin?: string | null; priceMax?: string | null; country?: string | null; sort?: string | null }
) {
  const supabase = await createServerSupabaseClient();
  const limit = 20;
  
  let query = supabase
    .from("requests")
    .select("*")
    .eq("status", "open");
  
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

export default async function AppFeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const mode = (searchParams.mode === "for_you" || 
                searchParams.mode === "latest" || 
                searchParams.mode === "trending"
    ? searchParams.mode
    : "for_you") as FeedMode;

  const initialData = await fetchInitialFeedData(mode, {
    category: searchParams.category || null,
    priceMin: searchParams.priceMin || null,
    priceMax: searchParams.priceMax || null,
    country: searchParams.country || null,
    sort: searchParams.sort || null,
  });

  return (
    <div className="space-y-8">
      {/* Main Content: Requests on Left, Sidebar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requests Feed (8/12 width) */}
        <div className="lg:col-span-8 space-y-4">
          <PersonalizedFeed initialMode={mode} initialData={initialData} />
        </div>

        {/* Right Column: Promotional Sidebar (4/12 width) - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-4">
          <PromotionalSidebar />
        </div>
      </div>

    </div>
  );
}


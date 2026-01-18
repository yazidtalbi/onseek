import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeed } from "@/components/requests/request-feed";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = {
  category?: string;
  status?: string;
  sort?: string;
  q?: string;
  priceMin?: string;
  priceMax?: string;
  country?: string;
  page?: string;
};

export default async function AppFeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const status = searchParams.status ?? "open";
  const sort = searchParams.sort ?? "newest";
  const category = searchParams.category ?? "All";
  const queryText = searchParams.q?.trim() ?? "";
  const priceMin = searchParams.priceMin;
  const priceMax = searchParams.priceMax;
  const country = searchParams.country;

  let query = supabase.from("requests").select("*");
  if (status) {
    query = query.eq("status", status);
  }
  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  // Price filtering: show requests where the budget range overlaps with the filter range
  if (priceMin || priceMax) {
    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    
    if (min !== null && !isNaN(min)) {
      // Request budget_max should be >= filter min (or no max limit)
      query = query.or(`budget_max.gte.${min},budget_max.is.null`);
    }
    if (max !== null && !isNaN(max)) {
      // Request budget_min should be <= filter max (or no min limit)
      query = query.or(`budget_min.lte.${max},budget_min.is.null`);
    }
  }
  if (country) {
    query = query.ilike("country", `%${country}%`);
  }
  if (queryText) {
    const safeQuery = queryText.replace(/[%_]/g, "\\$&");
    query = query.or(
      `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
    );
  }
  if (sort === "active") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const page = parseInt(searchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get count separately
  const countQuery = supabase.from("requests").select("*", { count: "exact", head: true });
  if (status) {
    countQuery.eq("status", status);
  }
  if (category && category !== "All") {
    countQuery.eq("category", category);
  }
  if (priceMin || priceMax) {
    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    if (min !== null && !isNaN(min)) {
      countQuery.or(`budget_max.gte.${min},budget_max.is.null`);
    }
    if (max !== null && !isNaN(max)) {
      countQuery.or(`budget_min.lte.${max},budget_min.is.null`);
    }
  }
  if (country) {
    countQuery.ilike("country", `%${country}%`);
  }
  if (queryText) {
    const safeQuery = queryText.replace(/[%_]/g, "\\$&");
    countQuery.or(
      `title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
    );
  }

  const { count } = await countQuery;
  const { data: requests } = await query.range(offset, offset + limit - 1);
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div id="hero-search-section" className="flex flex-col items-center justify-center text-center space-y-6 py-12">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-semibold">
            Discover community-made{" "}
            <span className="text-foreground">requests</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the best products, links, and solutions shared by the community
          </p>
        </div>
        <form action="/" method="get" className="w-full max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder='Search for requests like "mechanical keyboard"'
              className="pl-12 h-14 text-base bg-white border-border rounded-full"
              defaultValue={queryText}
            />
          </div>
        </form>
      </div>

      <RequestFilters />

      <RequestFeed
        initialRequests={requests ?? []}
        filters={{
          category,
          status,
          sort,
          query: queryText || null,
          priceMin: priceMin || null,
          priceMax: priceMax || null,
          country: country || null,
        }}
        page={page}
        totalPages={totalPages}
      />

      {/* About Onseek Section */}
      <div className="space-y-8 pt-12 border-t border-border">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">What is Onseek?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Post Your Request</h3>
              <p className="text-muted-foreground">
                Describe what you're looking for, set your budget, and specify any requirements. 
                The community will help you find the best options available.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Get Quality Submissions</h3>
              <p className="text-muted-foreground">
                Members submit verified product links with detailed notes and pricing. 
                Each submission is reviewed and upvoted by the community for quality.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Choose the Winner</h3>
              <p className="text-muted-foreground">
                Review all submissions, compare prices and features, then select the winner. 
                The contributor earns points and reputation for helping you find what you need.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Build Your Reputation</h3>
              <p className="text-muted-foreground">
                Earn points by posting requests, submitting helpful links, getting upvotes, 
                and having your submissions selected as winners. Climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


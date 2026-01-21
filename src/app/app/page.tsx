import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeed } from "@/components/requests/request-feed";
import { RequestInputSection } from "@/components/requests/request-input-section";
import { PromotionalSidebar } from "@/components/requests/promotional-sidebar";

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

  // Fetch submission counts for requests
  let requestsWithCounts = requests ?? [];
  if (requests && requests.length > 0) {
    const requestIds = requests.map((r) => r.id);
    const { data: submissionCounts } = await supabase
      .from("submissions")
      .select("request_id")
      .in("request_id", requestIds);
    
    // Create a map of request_id -> submission count
    const countMap = new Map<string, number>();
    submissionCounts?.forEach((sub) => {
      const current = countMap.get(sub.request_id) || 0;
      countMap.set(sub.request_id, current + 1);
    });
    
    // Attach submission count to each request
    requestsWithCounts = requests.map((req) => ({
      ...req,
      submissionCount: countMap.get(req.id) || 0,
    }));
  }

  return (
    <div className="space-y-8">
      {/* Main Content: Requests on Left, Sidebar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requests Feed (8/12 width) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Hero Section */}
          <div id="hero-search-section" className="space-y-6 pb-8 max-w-4xl">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-semibold text-left">
                Discover{" "}
                <span className="text-foreground">
                  <br />
                  community-made requests
                </span>
              </h1>
              <p className="text-lg text-gray-600 text-left">
                Post what you're looking for and get quality submissions from the community
              </p>
            </div>
            {/* Request Input Section */}
            <div className="w-full">
              <RequestInputSection />
            </div>
          </div>
          <RequestFilters />
          <RequestFeed
            initialRequests={requestsWithCounts}
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
            forceListView={true}
          />
        </div>

        {/* Right Column: Promotional Sidebar (4/12 width) */}
        <div className="lg:col-span-4">
          <PromotionalSidebar />
        </div>
      </div>

    </div>
  );
}


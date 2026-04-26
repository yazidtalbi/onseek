import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeed } from "@/components/requests/request-feed";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { AuthProvider } from "@/components/layout/auth-provider";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Requests — Onseek",
  robots: {
    index: false,
    follow: true,
  },
};

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  priceMin?: string;
  priceMax?: string;
  country?: string;
  page?: string;
  pref?: string | string[];
  dealbreaker?: string | string[];
  condition?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow guests - no redirect
  let resolvedProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    resolvedProfile = profile;
    if (!resolvedProfile) {
      await supabase.from("profiles").upsert({
        id: user.id,
        username: user.email?.split("@")[0] || `user-${user.id.slice(0, 6)}`,
        display_name: user.user_metadata?.full_name || "Onseek member",
      });
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      resolvedProfile = data ?? null;
    }
  }

  const status = params.status ?? "open";
  const sort = params.sort ?? "newest";
  const category = params.category ?? "All";
  const queryText = params.q?.trim() ?? "";
  const priceMin = params.priceMin;
  const priceMax = params.priceMax;
  const country = params.country;
  const prefParam = params.pref;
  const dealbreakerParam = params.dealbreaker;
  const condition = params.condition;
  const prefs = Array.isArray(prefParam) ? prefParam : prefParam ? [prefParam] : [];
  const dealbreakers = Array.isArray(dealbreakerParam) ? dealbreakerParam : dealbreakerParam ? [dealbreakerParam] : [];

  let query = supabase.from("requests").select("*, profiles(username, avatar_url, first_name, last_name)");
  
  // Build base filters first
  if (status) {
    query = query.eq("status", status);
  }
  if (category && category !== "All") {
    query = query.eq("category", category);
  }
  if (country) {
    query = query.ilike("country", `%${country}%`);
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
  
  // Text search - use a filter that works with other conditions
  if (queryText) {
    const safeQuery = queryText.trim().replace(/[%_]/g, "\\$&");
    if (safeQuery) {
      // Search both title and description using or() with proper syntax
      // Format: "column.operator.value,column.operator.value"
      query = query.or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`);
    }
  }

  // Preferences and Dealbreakers
  prefs.forEach((pref) => {
    query = query.ilike("description", `%${pref}%`);
  });
  dealbreakers.forEach((deal) => {
    query = query.not("description", "ilike", `%${deal}%`);
  });
  
  if (condition && condition !== "Either" && condition !== "") {
    if (condition === "New") {
      query = query.in("condition", ["New", "Either"]);
    } else if (condition === "Used") {
      query = query.in("condition", ["Used", "Either"]);
    } else {
      query = query.eq("condition", condition);
    }
  }

  // Apply sorting
  if (sort === "active") {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const page = parseInt(params.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get count separately - apply same filters
  const countQuery = supabase.from("requests").select("*", { count: "exact", head: true });
  if (status) {
    countQuery.eq("status", status);
  }
  if (category && category !== "All") {
    countQuery.eq("category", category);
  }
  if (country) {
    countQuery.ilike("country", `%${country}%`);
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
  if (queryText) {
    const safeQuery = queryText.trim().replace(/[%_]/g, "\\$&");
    if (safeQuery) {
      countQuery.or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`);
    }
  }
  
  prefs.forEach((pref) => {
    countQuery.ilike("description", `%${pref}%`);
  });
  dealbreakers.forEach((deal) => {
    countQuery.not("description", "ilike", `%${deal}%`);
  });
  
  if (condition && condition !== "Either" && condition !== "") {
    if (condition === "New") {
      countQuery.in("condition", ["New", "Either"]);
    } else if (condition === "Used") {
      countQuery.in("condition", ["Used", "Either"]);
    } else {
      countQuery.eq("condition", condition);
    }
  }

  const { count, error: countError } = await countQuery;
  if (countError) {
    console.error("Error counting search results:", countError);
  }
  
  const { data: requests, error: queryError } = await query.range(offset, offset + limit - 1);
  if (queryError) {
    console.error("Error fetching search results:", queryError);
  }
  
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <AuthProvider user={user ?? null} profile={resolvedProfile ?? null}>
      <div className="flex flex-col min-h-screen bg-background pb-0">
        <AppNavbar />
        <main className="flex-1 w-full px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl w-full space-y-8">
            {/* Search Header */}
            <div className="space-y-4">
              <div>
              </div>
              <form action="/search" method="get" className="w-full max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder='Search for requests like "mechanical keyboard"'
                    className="pl-12 h-14 text-base  border-[#e5e7eb] rounded-full"
                    defaultValue={queryText}
                  />
                </div>
              </form>
            </div>

            {queryText ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    {count ?? 0} {count === 1 ? "request found" : "requests found"}
                  </p>
                  <RequestFilters />
                </div>

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
                  useHomeStyle={true}
                />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Enter a search term to find requests
              </div>
            )}
          </div>
        </main>
        <div className="mx-auto max-w-7xl w-full">
          <AppFooter />
        </div>
      </div>
    </AuthProvider>
  );
}


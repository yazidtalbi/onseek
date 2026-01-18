import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeed } from "@/components/requests/request-feed";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/components/layout/auth-provider";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
    <AuthProvider user={user ?? null} profile={resolvedProfile ?? null}>
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <AppNavbar />
        <main className="flex-1 w-full px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl w-full space-y-8">
            {/* Search Header */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-semibold">
                  {queryText ? `Search results for "${queryText}"` : "Search requests"}
                </h1>
                {queryText && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {count ?? 0} {count === 1 ? "request found" : "requests found"}
                  </p>
                )}
              </div>
              <form action="/search" method="get" className="w-full max-w-2xl">
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

            {queryText ? (
              <>
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
        <BottomNav />
      </div>
    </AuthProvider>
  );
}


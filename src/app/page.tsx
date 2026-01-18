import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeed } from "@/components/requests/request-feed";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/components/layout/auth-provider";

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

export default async function HomePage({
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
          <div className="mx-auto max-w-7xl w-full space-y-12">
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
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold">What is Onseek?</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl">
                    Onseek is a buyer-centric marketplace designed to simplify your shopping journey. 
                    Instead of spending hours searching for the right product, simply post what you need 
                    and let the community bring you the best options.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">1. Post Your Request</h3>
                    <p className="text-muted-foreground">
                      Describe what you want to buy, set your budget, and specify any requirements. 
                      Simple, fast, and straightforward.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">2. Receive Submissions</h3>
                    <p className="text-muted-foreground">
                      Others submit product links or offer their own items that match your request. 
                      All submissions come with prices and details, making comparison easy.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">3. Choose & Buy</h3>
                    <p className="text-muted-foreground">
                      Review the options, pick the best match for your needs, and make your purchase. 
                      The flow is smooth and designed to get you from request to purchase quickly.
                    </p>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <h3 className="text-xl font-semibold">Why Onseek?</h3>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li><strong className="text-foreground">Save time</strong> - No more endless searching through stores and marketplaces</li>
                    <li><strong className="text-foreground">Fast results</strong> - Get multiple options within minutes or hours</li>
                    <li><strong className="text-foreground">Easy process</strong> - Simple request, review, and purchase flow</li>
                    <li><strong className="text-foreground">Community-driven</strong> - Real people helping you find exactly what you need</li>
                  </ul>
                </div>
              </div>
            </div>
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

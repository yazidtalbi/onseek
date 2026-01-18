import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestRail } from "@/components/requests/request-rail";
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

  const queryText = searchParams.q?.trim() ?? "";

  // Helper function to fetch images for requests
  async function fetchImagesForRequests(requests: any[]) {
    if (!requests || requests.length === 0) return [];
    
    const requestIds = requests.map((r) => r.id);
    const { data: images } = await supabase
      .from("request_images")
      .select("request_id, image_url, image_order")
      .in("request_id", requestIds)
      .order("image_order", { ascending: true });
    
    const imageMap = new Map<string, string[]>();
    images?.forEach((img) => {
      const existing = imageMap.get(img.request_id) || [];
      if (existing.length < 3) {
        existing.push(img.image_url);
        imageMap.set(img.request_id, existing);
      }
    });
    
    return requests.map((req) => ({
      ...req,
      images: imageMap.get(req.id) || [],
    }));
  }

  // Fetch different rails of requests
  // 1. Recently Posted (newest requests)
  const { data: recentRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(8);
  const recentWithImages = await fetchImagesForRequests(recentRequests || []);

  // 2. Most Active (requests with most submissions, ordered by updated_at)
  const { data: activeRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .order("updated_at", { ascending: false })
    .limit(8);
  const activeWithImages = await fetchImagesForRequests(activeRequests || []);

  // 3. Tech Category
  const { data: techRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .eq("category", "Tech")
    .order("created_at", { ascending: false })
    .limit(8);
  const techWithImages = await fetchImagesForRequests(techRequests || []);

  // 4. Gaming Category
  const { data: gamingRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .eq("category", "Gaming")
    .order("created_at", { ascending: false })
    .limit(8);
  const gamingWithImages = await fetchImagesForRequests(gamingRequests || []);

  // 5. Fashion Category
  const { data: fashionRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .eq("category", "Fashion")
    .order("created_at", { ascending: false })
    .limit(8);
  const fashionWithImages = await fetchImagesForRequests(fashionRequests || []);

  // 6. Home & Living Category
  const { data: homeRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .eq("category", "Home & Living")
    .order("created_at", { ascending: false })
    .limit(8);
  const homeWithImages = await fetchImagesForRequests(homeRequests || []);

  // 7. High Budget Requests (budget_max >= 500)
  const { data: highBudgetRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .gte("budget_max", 500)
    .order("budget_max", { ascending: false })
    .limit(8);
  const highBudgetWithImages = await fetchImagesForRequests(highBudgetRequests || []);

  // 8. Auto Category
  const { data: autoRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .eq("category", "Auto")
    .order("created_at", { ascending: false })
    .limit(8);
  const autoWithImages = await fetchImagesForRequests(autoRequests || []);

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
                  Post what you're looking for and get quality submissions from the community
                </p>
              </div>
              <form action="/search" method="get" className="w-full max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder='Search for requests like "mechanical keyboard"'
                    className="pl-12 h-14 text-base bg-white border-[#e5e7eb] rounded-full"
                    defaultValue={queryText}
                  />
                </div>
              </form>
            </div>

            <RequestFilters />

            {/* Multiple Request Rails */}
            <div className="space-y-12">
              {/* Recently Posted */}
              <RequestRail
                title="Recently Posted"
                requests={recentWithImages}
                viewAllHref="/?sort=newest"
              />

              {/* Most Active */}
              <RequestRail
                title="Most Active"
                requests={activeWithImages}
                viewAllHref="/?sort=active"
              />

              {/* Tech Category */}
              {techWithImages.length > 0 && (
                <RequestRail
                  title="Tech"
                  requests={techWithImages}
                  viewAllHref="/app/category/tech"
                />
              )}

              {/* Gaming Category */}
              {gamingWithImages.length > 0 && (
                <RequestRail
                  title="Gaming"
                  requests={gamingWithImages}
                  viewAllHref="/app/category/gaming"
                />
              )}

              {/* Fashion Category */}
              {fashionWithImages.length > 0 && (
                <RequestRail
                  title="Fashion"
                  requests={fashionWithImages}
                  viewAllHref="/app/category/fashion"
                />
              )}

              {/* Home & Living Category */}
              {homeWithImages.length > 0 && (
                <RequestRail
                  title="Home & Living"
                  requests={homeWithImages}
                  viewAllHref="/app/category/home-living"
                />
              )}

              {/* Auto Category */}
              {autoWithImages.length > 0 && (
                <RequestRail
                  title="Auto"
                  requests={autoWithImages}
                  viewAllHref="/app/category/auto"
                />
              )}

              {/* High Budget */}
              {highBudgetWithImages.length > 0 && (
                <RequestRail
                  title="High Budget Requests"
                  requests={highBudgetWithImages}
                />
              )}
            </div>

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

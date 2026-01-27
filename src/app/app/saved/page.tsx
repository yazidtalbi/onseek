import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SavedRequestsList } from "@/components/requests/saved-requests-list";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeedWrapper } from "@/components/requests/request-feed-wrapper";
import { Bookmark } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SearchParams = {
  category?: string;
  sort?: string;
  priceMin?: string;
  priceMax?: string;
  country?: string;
};

export default async function SavedRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/app/saved");
  }

  // Fetch user's favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select("request_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const favoriteRequestIds = favorites?.map((f) => f.request_id) || [];

  // Fetch the actual requests
  let requests: any[] = [];
  if (favoriteRequestIds.length > 0) {
    let query = supabase
      .from("requests")
      .select("*")
      .in("id", favoriteRequestIds);

    // Apply filters
    const category = searchParams.category;
    const sort = searchParams.sort ?? "newest";
    const priceMin = searchParams.priceMin;
    const priceMax = searchParams.priceMax;
    const country = searchParams.country;

    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (priceMin || priceMax) {
      const min = priceMin ? parseFloat(priceMin) : null;
      const max = priceMax ? parseFloat(priceMax) : null;
      
      if (min !== null && !isNaN(min)) {
        query = query.or(`budget_max.gte.${min},budget_max.is.null`);
      }
      if (max !== null && !isNaN(max)) {
        query = query.or(`budget_min.lte.${max},budget_min.is.null`);
      }
    }
    if (country) {
      query = query.ilike("country", `%${country}%`);
    }
    if (sort === "active") {
      query = query.order("updated_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: favoriteRequests } = await query;
    
    // Sort to match favorite order if no filters applied
    if (!category && !priceMin && !priceMax && !country) {
      requests = favoriteRequestIds
        .map((id) => favoriteRequests?.find((r) => r.id === id))
        .filter((r) => r !== undefined) as any[];
    } else {
      requests = favoriteRequests || [];
    }
  }

  const filters = {
    category: searchParams.category || null,
    sort: searchParams.sort || "newest",
    priceMin: searchParams.priceMin || null,
    priceMax: searchParams.priceMax || null,
    country: searchParams.country || null,
    mine: false,
    requestIds: favoriteRequestIds.length > 0 ? favoriteRequestIds : null, // Only show saved requests
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-semibold">
              Saved Requests
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your favorite requests saved for later.
            </p>
          </div>
        </div>
      </div>

      {requests.length > 0 ? (
        <div className="max-w-2xl mx-auto w-full">
          <RequestFeedWrapper
            initialRequests={requests}
            filters={filters}
            page={1}
            totalPages={1}
            forceListView={false}
            allFavorited={true}
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto w-full">
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-base font-medium mb-2">No saved requests yet</p>
            <p className="text-sm">Start saving requests you're interested in by clicking the save button.</p>
          </div>
        </div>
      )}
    </div>
  );
}

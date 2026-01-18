import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFeed } from "@/components/requests/request-feed";
import { RequestFilters } from "@/components/requests/request-filters";

export const dynamic = "force-dynamic";

const validCategories = [
  "tech",
  "home",
  "fashion",
  "auto",
  "collectibles",
  "local",
];

const categoryDisplayNames: Record<string, string> = {
  tech: "Tech",
  home: "Home",
  fashion: "Fashion",
  auto: "Auto",
  collectibles: "Collectibles",
  local: "Local",
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: { status?: string; sort?: string; q?: string };
}) {
  const { category } = await params;
  const normalizedCategory = category.toLowerCase();

  if (!validCategories.includes(normalizedCategory)) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const status = searchParams.status ?? "open";
  const sort = searchParams.sort ?? "newest";
  const queryText = searchParams.q?.trim() ?? "";

  const categoryName = categoryDisplayNames[normalizedCategory];
  const dbCategory = categoryName; // Use the display name for database query

  let query = supabase.from("requests").select("*").eq("category", dbCategory);

  if (status) {
    query = query.eq("status", status);
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

  const { data: requests } = await query.limit(20);

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-semibold">{categoryName} Requests</h1>
        <p className="text-lg text-muted-foreground">
          Browse all {categoryName.toLowerCase()} requests from the community
        </p>
      </div>

      <RequestFilters />

      <RequestFeed
        initialRequests={requests ?? []}
        filters={{
          category: dbCategory,
          status,
          sort,
          query: queryText || null,
        }}
      />
    </div>
  );
}


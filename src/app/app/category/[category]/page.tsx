import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFeedWrapper } from "@/components/requests/request-feed-wrapper";
import { MAIN_CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

// Create mapping from URL slug to category name
const categorySlugMap: Record<string, string> = {
  tech: "Tech",
  gaming: "Gaming",
  fashion: "Fashion",
  "health-cosmetics": "Health & Cosmetics",
  "family-children": "Family & Children",
  "home-living": "Home & Living",
  "garden-diy": "Garden & DIY",
  auto: "Auto",
  grocery: "Grocery",
};

const validCategories = Object.keys(categorySlugMap);

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

  const categoryName = categorySlugMap[normalizedCategory];
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
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-semibold">{categoryName} Requests</h1>
        <p className="text-lg text-muted-foreground">
          Browse all {categoryName.toLowerCase()} requests from the community
        </p>
      </div>

      <RequestFeedWrapper
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


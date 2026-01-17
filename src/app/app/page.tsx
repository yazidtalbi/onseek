import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestFeed } from "@/components/requests/request-feed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

type SearchParams = {
  category?: string;
  status?: string;
  sort?: string;
  q?: string;
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

  let query = supabase.from("requests").select("*");
  if (status) {
    query = query.eq("status", status);
  }
  if (category && category !== "All") {
    query = query.eq("category", category);
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
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Latest requests</h1>
            <p className="text-sm text-muted-foreground">
              Discover what the community needs and help find the best links.
            </p>
          </div>
          <Button asChild variant="accent" size="sm">
            <Link href="/app/new">+ New request</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <form className="flex w-full gap-2">
          <Input
            name="q"
            placeholder="Search requests..."
            defaultValue={queryText}
            className="bg-card"
          />
          <Button type="submit" variant="outline" size="default">
            Search
          </Button>
        </form>
        <RequestFilters />
      </div>

      <RequestFeed
        initialRequests={requests ?? []}
        filters={{
          category,
          status,
          sort,
          query: queryText || null,
        }}
      />
    </div>
  );
}


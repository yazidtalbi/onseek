import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFeed } from "@/components/requests/request-feed";
import { Card, CardContent } from "@/components/ui/card";
// Removed NewRequestButton import as the button has been removed from this page.

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
};

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const status = searchParams.status ?? "all";
  let query = supabase.from("requests").select("*, profiles(username, avatar_url)").eq("user_id", user.id);
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const { data: requests } = await query.order("created_at", { ascending: false });

  const { count: totalCount } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const { count: openCount } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "open");
  const { count: solvedCount } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "solved");

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl text-foreground" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>Requests</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Track your open requests and mark winning submissions.
          </p>
        </div>
      </div>

      <hr className="border-[#e5e7eb] my-2" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-none bg-white">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{totalCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-none bg-white">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-semibold">{openCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-none bg-white">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Solved</p>
            <p className="text-2xl font-semibold">{solvedCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <RequestFeed
          initialRequests={requests ?? []}
          filters={{ mine: true, status: status === "all" ? null : status }}
          useHomeStyle={true}
          disableHover={true}
          forceListView={true}
        />
      </div>
    </div>
  );
}

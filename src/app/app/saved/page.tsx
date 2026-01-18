import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SavedRequestsList } from "@/components/requests/saved-requests-list";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SavedRequestsPage() {
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
    const { data: favoriteRequests } = await supabase
      .from("requests")
      .select("*")
      .in("id", favoriteRequestIds)
      .order("created_at", { ascending: false });
    
    // Sort to match favorite order
    requests = favoriteRequestIds
      .map((id) => favoriteRequests?.find((r) => r.id === id))
      .filter((r) => r !== undefined) as any[];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#e5e7eb] bg-white/80 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Heart className="h-8 w-8 fill-current text-red-500" />
            Saved Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your favorite requests saved for later.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/app/new">New request</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#e5e7eb] bg-white/80">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-2xl font-semibold">{requests.length}</p>
          </CardContent>
        </Card>
      </div>

      {requests.length > 0 ? (
        <SavedRequestsList initialRequests={requests} />
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-base font-medium mb-2">No saved requests yet</p>
          <p className="text-sm">Start saving requests you're interested in by clicking the heart icon.</p>
        </div>
      )}
    </div>
  );
}

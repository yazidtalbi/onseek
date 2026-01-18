import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ReputationBadge } from "@/components/profile/badge";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("reputation", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e5e7eb] bg-white/80 p-6">
        <h1 className="text-3xl font-semibold">Top hunters</h1>
        <p className="text-sm text-muted-foreground">
          Recognize the community members with the most accepted links.
        </p>
      </div>
      <div className="grid gap-4">
        {profiles?.map((profile, index) => (
          <Card key={profile.id} className="border-[#e5e7eb] bg-white/80">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">#{index + 1}</p>
                <Link
                  href={`/app/profile/${profile.username}`}
                  className="text-lg font-semibold"
                >
                  {profile.display_name || profile.username}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {profile.reputation ?? 0} pts
                </span>
                <ReputationBadge reputation={profile.reputation ?? 0} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


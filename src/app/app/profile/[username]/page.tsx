import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/profile-header";
import { RequestCard } from "@/components/requests/request-card";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) {
    notFound();
  }

  const { count: solvedCount } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("status", "solved");

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} solvedCount={solvedCount ?? 0} />
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Recent requests</h2>
        {requests?.length ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white/50 p-6 text-center text-sm text-muted-foreground">
            No requests yet.
          </div>
        )}
      </div>
    </div>
  );
}


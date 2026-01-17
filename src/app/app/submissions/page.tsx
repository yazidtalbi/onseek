import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MySubmissionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, requests(id, title, status, winner_submission_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-white/80 p-6">
        <h1 className="text-3xl font-semibold">My submissions</h1>
        <p className="text-sm text-muted-foreground">
          Track every link you have shared with the community.
        </p>
      </div>

      <div className="space-y-4">
        {submissions?.length ? (
          submissions.map((submission) => {
            const request = submission.requests as {
              id: string;
              title: string;
              status: string;
              winner_submission_id: string | null;
            };
            const isWinner = request?.winner_submission_id === submission.id;
            return (
              <Card key={submission.id} className="border-border bg-white/80">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <Link
                        href={`/app/requests/${request?.id}`}
                        className="text-lg font-semibold"
                      >
                        {request?.title || "Request"}
                      </Link>
                      <p className="text-xs text-muted-foreground">{submission.url}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isWinner ? <Badge>Winner</Badge> : null}
                      <Badge variant="outline">{request?.status}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {submission.store_name ? (
                      <span>{submission.store_name}</span>
                    ) : null}
                    {submission.price ? (
                      <span> · ${Number(submission.price).toFixed(2)}</span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white/50 p-6 text-center text-sm text-muted-foreground">
            No submissions yet. Explore requests and help find links.
          </div>
        )}
      </div>
    </div>
  );
}


import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { RequestActions } from "@/components/requests/request-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReportDialog } from "@/components/reports/report-dialog";

export const dynamic = "force-dynamic";

function computeScore(
  item: Submission & {
    votes?: { vote: number; user_id: string }[];
    profiles?: { reputation: number | null };
  },
  userId?: string | null
) {
  const votes = item.votes;
  const upvotes = votes?.filter((v) => v.vote === 1).length || 0;
  const downvotes = votes?.filter((v) => v.vote === -1).length || 0;
  const hasVoted = votes?.find((v) => v.user_id === userId)?.vote || 0;
  const reputationBonus = Math.floor((item.profiles?.reputation ?? 0) / 50);
  return {
    ...item,
    upvotes,
    downvotes,
    score: upvotes - downvotes + reputationBonus,
    has_voted: hasVoted,
  } as Submission;
}

export default async function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: request } = await supabase
    .from("requests")
    .select("*, profiles(username, display_name)")
    .eq("id", params.id)
    .single();

  if (!request) {
    notFound();
  }

  const { data: links } = await supabase
    .from("request_links")
    .select("*")
    .eq("request_id", params.id);

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, votes(vote, user_id), profiles(reputation)")
    .eq("request_id", params.id)
    .order("created_at", { ascending: false });

  const initialSubmissions =
    submissions?.map((item) => computeScore(item as Submission, user?.id)) ?? [];

  const isOwner = user?.id === request.user_id;
  const canSubmit = request.status === "open" && !isOwner;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-white/80">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge variant="muted">{request.status.toUpperCase()}</Badge>
              <h1 className="text-3xl font-semibold">{request.title}</h1>
              <p className="text-sm text-muted-foreground">
                Posted by @{request.profiles?.username || "member"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOwner ? (
                <RequestActions requestId={request.id} status={request.status} />
              ) : null}
              <ReportDialog type="request" targetId={request.id} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{request.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{request.category}</span>
            {request.country ? <span>· {request.country}</span> : null}
            {request.condition ? <span>· {request.condition}</span> : null}
            {request.urgency ? <span>· {request.urgency}</span> : null}
            {request.budget_min ? <span>· From ${request.budget_min}</span> : null}
            {request.budget_max ? <span>· To ${request.budget_max}</span> : null}
          </div>
          {links?.length ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Reference links</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block underline"
                  >
                    {link.url}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {canSubmit ? (
        <Card className="border-border bg-white/80">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">Submit a link</h2>
            <p className="text-sm text-muted-foreground">
              Help the requester by sharing a trusted buying option.
            </p>
            <div className="mt-4">
              <SubmissionForm requestId={request.id} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Submissions</h2>
        <SubmissionList
          requestId={request.id}
          initialSubmissions={initialSubmissions}
          winnerId={request.winner_submission_id}
          canSelectWinner={isOwner}
          requestStatus={request.status}
        />
      </div>
    </div>
  );
}


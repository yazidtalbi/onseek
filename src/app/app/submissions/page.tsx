import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SubmissionCard } from "@/components/submissions/submission-card";
import type { Submission } from "@/lib/types";
import Link from "next/link";
import { createRequestUrl } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

function computeScore(
  item: Submission & {
    votes?: { vote: number; user_id: string }[];
  },
  userId?: string | null
) {
  const votes = item.votes;
  const upvotes = votes?.filter((v) => v.vote === 1).length || 0;
  const downvotes = votes?.filter((v) => v.vote === -1).length || 0;
  const hasVoted = userId
    ? votes?.some((v) => v.user_id === userId) || false
    : false;
  const voteValue = votes?.find((v) => v.user_id === userId)?.vote || 0;

  return {
    ...item,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    has_voted: voteValue,
  } as Submission;
}

export default async function MySubmissionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch submissions with votes and profiles, and request info
  const { data: submissionsData } = await supabase
    .from("submissions")
    .select("*, votes(vote, user_id), profiles(username), requests(id, title, user_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const submissions = submissionsData
    ? submissionsData.map((item) => computeScore(item as Submission, user.id))
    : [];

  // Get request owner IDs for winner selection
  const requestOwnerIds: Record<string, string> = {};
  submissions.forEach((sub) => {
    const request = (sub as any).requests;
    if (request?.id && request?.user_id) {
      requestOwnerIds[request.id] = request.user_id;
    }
  });

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-semibold">Proposals</h1>
          <p className="text-sm text-muted-foreground">
            Track every link you have shared with the community.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-4">
        {submissions.length > 0 ? (
          submissions.map((submission, index) => {
            const request = (submission as any).requests;
            const requestId = request?.id;
            const requestTitle = request?.title;
            
            return (
              <div key={submission.id} className="space-y-2">
                {/* Link to parent request */}
                {requestId && requestTitle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>For request:</span>
                    <Link
                      href={requestTitle ? createRequestUrl(requestId, requestTitle) : `/app/requests/${requestId}`}
                      className="text-[#7755FF] hover:underline font-medium"
                    >
                      {requestTitle}
                    </Link>
                  </div>
                )}
                
                <SubmissionCard
                  submission={submission}
                  requestId={requestId || ""}
                  requestTitle={requestTitle}
                  isFirst={index === 0}
                  isLast={index === submissions.length - 1}
                  requestOwnerId={requestId ? requestOwnerIds[requestId] : undefined}
                />
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e5e7eb]  p-6 text-center text-sm text-gray-600">
            No proposals yet. Explore requests and help find links.
          </div>
        )}
      </div>
    </div>
  );
}


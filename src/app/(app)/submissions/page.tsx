import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SubmissionCard } from "@/components/submissions/submission-card";
import { MySubmissionsView } from "@/components/submissions/my-submissions-view";
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
    .select("*, votes(vote, user_id), profiles(username), requests(*)")
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
    <div className="w-full max-w-[1100px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start justify-center">
        {/* Left Column: Header */}
        <div className="w-full md:w-[280px] shrink-0 space-y-6 sticky top-24">
          <div>
            <h1 className="text-4xl text-foreground" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>Proposals</h1>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Track every link you have shared with the community. Manage your submissions and monitor their acceptance status.
            </p>
          </div>
        </div>

        {/* Right Column: Proposals View (Client Component) */}
        <MySubmissionsView
          initialSubmissions={submissions}
          requestOwnerIds={requestOwnerIds}
        />
      </div>
    </div>
  );
}


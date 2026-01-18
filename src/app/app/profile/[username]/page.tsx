import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileActivity } from "@/components/profile/profile-activity";
import { Plus, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch all requests created by user
  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Fetch all submissions by user
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // Fetch requests where user's submission was selected as winner
  const { data: winningRequests } = await supabase
    .from("requests")
    .select("id, title, winner_submission_id, created_at")
    .eq("status", "solved")
    .in("winner_submission_id", submissions?.map(s => s.id) || []);

  // Fetch votes on user's submissions
  const { data: votes } = await supabase
    .from("votes")
    .select("submission_id, vote")
    .in("submission_id", submissions?.map(s => s.id) || []);

  // Compute activities and points
  const activities: Array<{
    id: string;
    type: "request" | "submission" | "winner" | "vote";
    points: number;
    description: string;
    link: string;
    timestamp: string;
  }> = [];

  // Add requests (questions) - +5 points each
  requests?.forEach((request) => {
      activities.push({
        id: request.id,
        type: "request",
        points: 5,
        description: `Posted ${request.title}`,
        link: `/app/requests/${request.id}`,
        timestamp: request.created_at,
      });
  });

  // Add submissions (answers) - +2 points each
  submissions?.forEach((submission) => {
    const isWinner = winningRequests?.some(r => r.winner_submission_id === submission.id);
    const submissionVotes = votes?.filter(v => v.submission_id === submission.id) || [];
    const upvotes = submissionVotes.filter(v => v.vote === 1).length;
    
    if (isWinner) {
      // Winner - +10 points
      activities.push({
        id: `winner-${submission.id}`,
        type: "winner",
        points: 10,
        description: `+10 Accepted answer in ${requests?.find(r => r.id === submission.request_id)?.title || "a request"}`,
        link: `/app/requests/${submission.request_id}`,
        timestamp: submission.created_at,
      });
    } else {
      // Regular submission - +2 points
      activities.push({
        id: `submission-${submission.id}`,
        type: "submission",
        points: 2,
        description: `Posted ${(submission as any).article_name || (submission as any).store_name || "a submission"}`,
        link: `/app/requests/${submission.request_id}`,
        timestamp: submission.created_at,
      });
    }

    // Add upvote points - +1 per upvote
    if (upvotes > 0) {
      for (let i = 0; i < upvotes; i++) {
        activities.push({
          id: `vote-${submission.id}-${i}`,
          type: "vote",
          points: 1,
          description: `Received upvote on ${(submission as any).article_name || (submission as any).store_name || "submission"}`,
          link: `/app/requests/${submission.request_id}`,
          timestamp: submission.created_at,
        });
      }
    }
  });

  // Sort activities by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculate total points
  const points = activities.reduce((sum, activity) => sum + activity.points, 0);

  const requestsCount = requests?.length || 0;
  const submissionsCount = submissions?.length || 0;
  const winnersCount = winningRequests?.length || 0;

  return (
    <div className="space-y-6">
      <ProfileActivity
        profile={profile}
        activities={activities}
        requestsCount={requestsCount}
        submissionsCount={submissionsCount}
        winnersCount={winnersCount}
        points={points}
      />
    </div>
  );
}


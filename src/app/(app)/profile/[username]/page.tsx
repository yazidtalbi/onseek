import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { RequestItem, Submission } from "@/lib/types";
import Image from "next/image";
import { createRequestUrl } from "@/lib/utils/slug";

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
    .select("*, profiles(username, avatar_url)")
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
        link: createRequestUrl(request.slug),
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
        link: submission.request_id && requests?.find(r => r.id === submission.request_id) 
          ? createRequestUrl(requests.find(r => r.id === submission.request_id)!.slug)
          : `/requests/${submission.request_id}`,
        timestamp: submission.created_at,
      });
    } else {
      // Regular submission - +2 points
      activities.push({
        id: `submission-${submission.id}`,
        type: "submission",
        points: 2,
        description: `Posted ${(submission as any).article_name || (submission as any).store_name || "a submission"}`,
        link: submission.request_id && requests?.find(r => r.id === submission.request_id) 
          ? createRequestUrl(requests.find(r => r.id === submission.request_id)!.slug)
          : `/requests/${submission.request_id}`,
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
          description: `Received upvote on ${(submission as any).article_name || "submission"}`,
          link: submission.request_id && requests?.find(r => r.id === submission.request_id) 
          ? createRequestUrl(requests.find(r => r.id === submission.request_id)!.slug)
          : `/requests/${submission.request_id}`,
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

  // Fetch images and links for requests
  let requestImages: Record<string, string[]> = {};
  let requestLinks: Record<string, string[]> = {};
  if (requests && requests.length > 0) {
    const requestIds = requests.map((r) => r.id);
    const { data: images } = await supabase
      .from("request_images")
      .select("request_id, image_url, image_order")
      .in("request_id", requestIds)
      .order("image_order", { ascending: true });

    const { data: links } = await supabase
      .from("request_links")
      .select("request_id, url")
      .in("request_id", requestIds);

    if (images) {
      images.forEach((img) => {
        if (!requestImages[img.request_id]) {
          requestImages[img.request_id] = [];
        }
        requestImages[img.request_id].push(img.image_url);
      });
    }

    if (links) {
      links.forEach((link) => {
        if (!requestLinks[link.request_id]) {
          requestLinks[link.request_id] = [];
        }
        requestLinks[link.request_id].push(link.url);
      });
    }
  }

  // Fetch user for favorites and votes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch favorite status for requests
  let requestFavorites: Set<string> = new Set();
  if (user && requests && requests.length > 0) {
    const requestIds = requests.map((r) => r.id);
    const { data: favorites } = await supabase
      .from("favorites")
      .select("request_id")
      .eq("user_id", user.id)
      .in("request_id", requestIds);

    if (favorites) {
      favorites.forEach((fav) => {
        requestFavorites.add(fav.request_id);
      });
    }
  }

  // Fetch submission counts
  let requestSubmissionCounts: Record<string, number> = {};
  if (requests && requests.length > 0) {
    const requestIds = requests.map((r) => r.id);
    const { data: submissionCounts } = await supabase
      .from("submissions")
      .select("request_id")
      .in("request_id", requestIds);

    if (submissionCounts) {
      submissionCounts.forEach((sub) => {
        const current = requestSubmissionCounts[sub.request_id] || 0;
        requestSubmissionCounts[sub.request_id] = current + 1;
      });
    }
  }

  const requestsWithCounts = (requests || []).map((r) => ({
    ...r,
    submissionCount: requestSubmissionCounts[r.id] || 0,
  })) as RequestItem[];

  // Get winning submissions
  const winningSubmissions = (submissions || []).filter((sub) =>
    winningRequests?.some((r) => r.winner_submission_id === sub.id)
  );
  
  let submissionVotes: Record<string, { vote: number; user_id: string }[]> = {};
  if (submissions && submissions.length > 0) {
    const submissionIds = submissions.map((s) => s.id);
    const { data: allVotes } = await supabase
      .from("votes")
      .select("submission_id, vote, user_id")
      .in("submission_id", submissionIds);

    if (allVotes) {
      allVotes.forEach((vote) => {
        if (!submissionVotes[vote.submission_id]) {
          submissionVotes[vote.submission_id] = [];
        }
        submissionVotes[vote.submission_id].push(vote);
      });
    }
  }

  // Compute scores for submissions
  const computeScore = (submission: any) => {
    const votes = submissionVotes[submission.id] || [];
    const upvotes = votes.filter((v) => v.vote === 1).length;
    const hasVoted = votes.find((v) => v.user_id === user?.id)?.vote || 0;
    return {
      ...submission,
      upvotes,
      score: upvotes,
      has_voted: hasVoted,
    } as Submission;
  };

  const submissionsWithScores = (submissions || []).map(computeScore);
  const winningSubmissionsWithScores = winningSubmissions.map(computeScore);

  // Fetch request data for submissions
  let submissionRequests: Record<string, any> = {};
  if (submissions && submissions.length > 0) {
    const requestIds = [...new Set(submissions.map((s) => s.request_id))];
    const { data: requestData } = await supabase
      .from("requests")
      .select("*")
      .in("id", requestIds);

    if (requestData) {
      requestData.forEach((req) => {
        submissionRequests[req.id] = req;
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card with Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-6">
            <div className="p-0 space-y-4">
              <div className="flex flex-col items-start text-left gap-5">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {profile.avatar_url ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#e5e7eb]">
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || profile.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-[#e5e7eb] flex items-center justify-center">
                      <span className="text-2xl font-semibold text-gray-600">
                        {(profile.display_name || profile.username)[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {/* Profile Info */}
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                    {profile.username}
                  </h1>
                  {profile.display_name && profile.display_name !== profile.username && (
                    <p className="text-lg font-medium text-gray-900 mt-1">{profile.display_name}</p>
                  )}
                  {profile.bio && (
                    <p className="text-sm text-gray-500 mt-3 max-w-sm">{profile.bio}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-4 font-medium">
                    Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-6 mt-4 transition-all duration-300">
                <div className="flex flex-col items-start text-left">
                  <p className="text-[11px] font-bold text-gray-400 mb-1">Points</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{points}</p>
                </div>
                <div className="flex flex-col items-start text-left">
                  <p className="text-[11px] font-bold text-gray-400 mb-1">Requests</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{requestsCount}</p>
                </div>
                <div className="flex flex-col items-start text-left">
                  <p className="text-[11px] font-bold text-gray-400 mb-1">Submissions</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{submissionsCount}</p>
                </div>
                <div className="flex flex-col items-start text-left">
                  <p className="text-[11px] font-bold text-gray-400 mb-1">Winners</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{winnersCount}</p>
                </div>
              </div>

              {/* Edit Profile Button for Owner */}
              {user?.id === profile.id && (
                <div className="pt-2">
                  <Link href="/settings" className="block w-full">
                    <Button variant="outline" className="w-full h-11 rounded-full text-sm font-bold border-gray-200 hover:bg-gray-50 transition-colors">
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tabs for Activity, Requests, Submissions, Winners */}
        <div className="lg:col-span-2">
          <ProfileTabs
            requests={requestsWithCounts}
            submissions={submissionsWithScores}
            winners={winningSubmissionsWithScores}
            requestImages={requestImages}
            requestLinks={requestLinks}
            requestFavorites={requestFavorites}
            submissionRequests={submissionRequests}
            winningRequestIds={winningRequests?.map((r) => r.id) || []}
            activities={activities}
          />
        </div>
      </div>
    </div>
  );
}


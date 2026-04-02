import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { RequestCard } from "@/components/requests/request-card";
import { BackButton } from "@/components/ui/back-button";
import { ChevronRight } from "lucide-react";
import { ShareButton } from "@/components/requests/share-button";
import { RequestDetailView } from "@/components/requests/request-detail-view";

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
  const hasVoted = votes?.find((v) => v.user_id === userId)?.vote || 0;
  return {
    ...item,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    has_voted: hasVoted,
  } as Submission;
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: request } = await supabase
    .from("requests")
    .select("*, profiles(username)")
    .eq("id", id)
    .single();

  if (!request) {
    notFound();
  }

  const { data: links } = await supabase
    .from("request_links")
    .select("*")
    .eq("request_id", id);

  const { data: images } = await supabase
    .from("request_images")
    .select("*")
    .eq("request_id", id)
    .order("image_order", { ascending: true });

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, votes(vote, user_id), profiles(username)")
    .eq("request_id", id)
    .order("created_at", { ascending: false });

  const initialSubmissions =
    submissions?.map((item) => computeScore(item as Submission, user?.id)) ?? [];

  // Fetch similar requests (same category, exclude current request)
  const { data: similarRequests } = await supabase
    .from("requests")
    .select("*")
    .eq("category", request.category)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch images for similar requests
  let similarRequestImages: Record<string, string[]> = {};
  if (similarRequests && similarRequests.length > 0) {
    const similarRequestIds = similarRequests.map((r) => r.id);
    const { data: similarImages } = await supabase
      .from("request_images")
      .select("request_id, image_url, image_order")
      .in("request_id", similarRequestIds)
      .order("image_order", { ascending: true });

    if (similarImages) {
      similarImages.forEach((img) => {
        if (!similarRequestImages[img.request_id]) {
          similarRequestImages[img.request_id] = [];
        }
          similarRequestImages[img.request_id].push(img.image_url);
      });
    }
  }

  // Fetch submission counts for similar requests
  let similarRequestSubmissionCounts: Record<string, number> = {};
  if (similarRequests && similarRequests.length > 0) {
    const similarRequestIds = similarRequests.map((r) => r.id);
    const { data: submissionCounts } = await supabase
      .from("submissions")
      .select("request_id")
      .in("request_id", similarRequestIds);

    if (submissionCounts) {
      submissionCounts.forEach((sub) => {
        const current = similarRequestSubmissionCounts[sub.request_id] || 0;
        similarRequestSubmissionCounts[sub.request_id] = current + 1;
      });
    }
  }

  // Fetch favorite status for similar requests
  let similarRequestFavorites: Set<string> = new Set();
  if (user && similarRequests && similarRequests.length > 0) {
    const similarRequestIds = similarRequests.map((r) => r.id);
    const { data: favorites } = await supabase
      .from("favorites")
      .select("request_id")
      .eq("user_id", user.id)
      .in("request_id", similarRequestIds);

    if (favorites) {
      favorites.forEach((fav) => {
        similarRequestFavorites.add(fav.request_id);
      });
    }
  }

  const isOwner = user?.id === request.user_id;
  // Allow guests to see submission form (they'll be redirected to login on click)
  const showSubmissionForm = request.status === "open";

  // Check if request is favorited
  let isFavorite = false;
  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("request_id", id)
      .single();
    isFavorite = !!favorite;
  }

  const proposalCount = initialSubmissions.length;

  return (
    <RequestDetailView
      request={request}
      images={images || []}
      links={links || []}
      initialSubmissions={initialSubmissions}
      user={user}
      isOwner={isOwner}
      showSubmissionForm={showSubmissionForm}
      isFavorite={isFavorite}
      proposalCount={proposalCount}
      similarRequests={similarRequests || []}
      similarRequestImages={similarRequestImages}
      similarRequestSubmissionCounts={similarRequestSubmissionCounts}
      similarRequestFavorites={Array.from(similarRequestFavorites)}
    />
  );
}


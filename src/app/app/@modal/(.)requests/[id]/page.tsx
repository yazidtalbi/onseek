import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";
import { RequestDetailView } from "@/components/requests/request-detail-view";
import { RequestModal } from "@/components/requests/request-modal";

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

export default async function InterceptedRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all data in parallel
  const [
    requestRes,
    linksRes,
    imagesRes,
    submissionsRes,
    favoriteRes,
  ] = await Promise.all([
    supabase
      .from("requests")
      .select("*, profiles(username)")
      .eq("id", id)
      .single(),
    supabase.from("request_links").select("*").eq("request_id", id),
    supabase
      .from("request_images")
      .select("*")
      .eq("request_id", id)
      .order("image_order", { ascending: true }),
    supabase
      .from("submissions")
      .select("*, votes(vote, user_id), profiles(username)")
      .eq("request_id", id)
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("request_id", id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const request = requestRes.data;
  if (!request) notFound();

  const initialSubmissions =
    submissionsRes.data?.map((item) =>
      computeScore(item as Submission, user?.id)
    ) ?? [];

  const isOwner = user?.id === request.user_id;
  const showSubmissionForm = request.status === "open";
  const isFavorite = !!favoriteRes.data;
  const proposalCount = initialSubmissions.length;

  return (
    <RequestModal requestId={id}>
      <RequestDetailView
        request={request}
        images={imagesRes.data || []}
        links={linksRes.data || []}
        initialSubmissions={initialSubmissions}
        user={user}
        isOwner={isOwner}
        showSubmissionForm={showSubmissionForm}
        isFavorite={isFavorite}
        proposalCount={proposalCount}
        isModal={true}
      />
    </RequestModal>
  );
}

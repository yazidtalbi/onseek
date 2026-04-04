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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  const requestRes = await supabase
    .from("requests")
    .select("*, profiles(username)")
    .eq("slug", slug)
    .maybeSingle();

  let request = requestRes.data;
  
  // Fallback for legacy UUID links
  if (!request && (slug.length >= 20 || slug.includes("-"))) {
    const fallbackRes = await supabase
      .from("requests")
      .select("*, profiles(username)")
      .eq("id", slug)
      .maybeSingle();
    request = fallbackRes.data;
  }
  
  if (!request) notFound();
  const id = request.id;

  // Fetch relations in parallel using the retrieved ID
  const [
    linksRes,
    imagesRes,
    submissionsRes,
    favoriteRes,
  ] = await Promise.all([
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


  const initialSubmissions =
    submissionsRes.data?.map((item) =>
      computeScore(item as Submission, user?.id)
    ) ?? [];

  const isOwner = user?.id === request.user_id;
  const showSubmissionForm = request.status === "open";
  const isFavorite = !!favoriteRes.data;
  const proposalCount = initialSubmissions.length;

  return (
    <RequestModal requestId={id} requestSlug={request.slug}>
      <RequestDetailView
        request={request}
        images={imagesRes.data || []}
        links={linksRes.data || []}
        initialSubmissions={initialSubmissions}
        user={user}
        isOwner={isOwner}
        isAdmin={isAdmin}
        showSubmissionForm={showSubmissionForm}
        isFavorite={isFavorite}
        proposalCount={proposalCount}
        isModal={true}
      />
    </RequestModal>
  );
}

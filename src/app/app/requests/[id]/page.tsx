import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { RequestCard } from "@/components/requests/request-card";
import { BackButton } from "@/components/ui/back-button";
import { AnnouncementBanner } from "@/components/requests/announcement-banner";
import { ChevronRight } from "lucide-react";
import { ShareButton } from "@/components/requests/share-button";

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

  // Check if request should show announcement banner (no proposals and old)
  const hasNoSubmissions = proposalCount === 0;
  const requestAge = new Date().getTime() - new Date(request.created_at).getTime();
  const daysOld = requestAge / (1000 * 60 * 60 * 24);
  const shouldShowAnnouncement = hasNoSubmissions && daysOld >= 7; // Show if 7+ days old with no proposals

  return (
    <div className="mx-auto w-full space-y-6 px-4 md:px-6">
      {/* Back Button and Breadcrumbs */}
      <div className="flex items-center gap-4">
        <BackButton />
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link 
            href={`/app/category/${request.category.toLowerCase()}`} 
            className="hover:text-foreground transition-colors text-foreground font-medium"
          >
            {request.category}
          </Link>
        </nav>
      </div>

      {/* Two Column Layout: Request on Left, Submissions on Right */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
        {/* Left Column: Request Details - Sticky on scroll */}
        <div className="w-full lg:w-[55%] space-y-6 flex-shrink-0 lg:sticky lg:top-24 self-start">
          <RequestCard
            request={request}
            variant="detail"
            isFavorite={isFavorite}
            images={images?.map((img: any) => img.image_url) || []}
            links={links?.map((link: any) => link.url) || []}
            proposalCount={proposalCount}
            noBorder={true}
            noPadding={true}
            noRounding={true}
            headerActions={<ShareButton requestId={request.id} />}
          />
        </div>


        {/* Right Column: Proposals */}
        <div className="flex-1 space-y-6 min-w-0">
          {shouldShowAnnouncement && (
            <AnnouncementBanner />
          )}
          <div className="space-y-4">
            {showSubmissionForm ? (
              <SubmissionForm 
                requestId={request.id} 
                requestBudgetMax={request.budget_max} 
                requestDescription={request.description}
                hideButton={proposalCount === 0}
              />
            ) : null}
          </div>
          <SubmissionList
            requestId={request.id}
            requestTitle={request.title}
            initialSubmissions={initialSubmissions}
            winnerId={request.winner_submission_id}
            canSelectWinner={isOwner}
            requestStatus={request.status}
            requestOwnerId={request.user_id}
          />
        </div>
      </div>

      {similarRequests && similarRequests.length > 0 ? (
        <div className="space-y-4 pt-12 mt-12">
          <h2 className="text-2xl font-semibold text-foreground">Similar requests</h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {similarRequests.map((similarRequest) => (
              <div key={similarRequest.id} className="break-inside-avoid mb-6 bg-[#f5f6f9] rounded-[20px] p-[6px] transition-all duration-300 ease-out hover:-translate-y-1.5 shadow-none hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]">
                <RequestCard
                  request={{
                    ...similarRequest,
                    submissionCount: similarRequestSubmissionCounts[similarRequest.id] || 0,
                  }}
                  variant="detail"
                  smallImages={true}
                  images={similarRequestImages[similarRequest.id] || []}
                  isFavorite={similarRequestFavorites.has(similarRequest.id)}
                  noBorder={true}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


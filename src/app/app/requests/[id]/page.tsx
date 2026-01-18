import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { RequestActions } from "@/components/requests/request-actions";
import { RequestCardGrid } from "@/components/requests/request-card-grid";
import { RequestMenu } from "@/components/requests/request-menu";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReportDialog } from "@/components/reports/report-dialog";
import { ChevronRight, Lock, Package, Settings, DollarSign, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageCarousel } from "@/components/requests/image-carousel";

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
    .select("*, profiles(username, display_name)")
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
    .select("*, votes(vote, user_id)")
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
        if (similarRequestImages[img.request_id].length < 3) {
          similarRequestImages[img.request_id].push(img.image_url);
        }
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

  // Parse request preferences from description
  function parseRequestPreferences(description: string) {
    const match = description.match(/<!--REQUEST_PREFS:({.*?})-->/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
    return null;
  }

  function cleanDescription(description: string) {
    return description.replace(/<!--REQUEST_PREFS:.*?-->/, "").trim();
  }

  const preferences = parseRequestPreferences(request.description) || {
    priceLock: "open",
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
  };
  const cleanDesc = cleanDescription(request.description);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Link 
          href="/"
          className="hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link 
          href={`/app/category/${request.category.toLowerCase()}`} 
          className="hover:text-foreground transition-colors"
        >
          {request.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{request.title}</span>
      </nav>

      {/* Two Column Layout: Request on Left, Submissions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Request Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-[#e5e7eb] bg-white relative">
            <CardContent className="space-y-4 p-6">
              {/* Heart and Ellipsis - Top Right */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
                <RequestMenu
                  requestId={request.id}
                  requestUserId={request.user_id}
                  status={request.status}
                />
              </div>
              
              <div className="space-y-2 pr-16">
                <Badge variant="muted">{request.status.toUpperCase()}</Badge>
                <h1 className="text-3xl font-semibold">{request.title}</h1>
                <p className="text-base text-gray-600">
                  Posted by @{request.profiles?.username || "member"}
                </p>
              </div>
              <p className="text-base text-gray-600">{cleanDesc}</p>
              
              {/* Request Images - Small thumbnails */}
              {images && images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-base font-semibold">Images</p>
                  <ImageCarousel images={images} />
                </div>
              )}
              
              {/* Request Details - Organized in sections */}
              <div className="space-y-3 pt-2">
                {/* Basic Info */}
                <div className="flex flex-wrap gap-2">
                  {request.country ? (
                    <Badge variant="muted" className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {request.country}
                    </Badge>
                  ) : null}
                  {request.condition ? <Badge variant="muted">{request.condition}</Badge> : null}
                  {request.urgency ? <Badge variant="muted">{request.urgency}</Badge> : null}
                </div>
                
                {/* Budget */}
                {(request.budget_min || request.budget_max) && (
                  <div className="flex flex-wrap gap-2 text-base text-gray-600">
                    {request.budget_min && request.budget_max ? (
                      <span>Budget: ${request.budget_min} - ${request.budget_max}</span>
                    ) : request.budget_min ? (
                      <span>Budget: From ${request.budget_min}</span>
                    ) : (
                      <span>Budget: Up to ${request.budget_max}</span>
                    )}
                  </div>
                )}
                
                {/* Request Options - Only show if any are set */}
                {(preferences.priceLock === "locked" || preferences.exactItem || preferences.exactSpecification || preferences.exactPrice) && (
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {preferences.priceLock === "locked" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="muted" className="flex items-center gap-1.5 cursor-help">
                              <Lock className="h-3.5 w-3.5" />
                              Price locked
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>No price greater than the specified budget will be accepted</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {preferences.exactItem && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="muted" className="flex items-center gap-1.5 cursor-help">
                              <Package className="h-3.5 w-3.5" />
                              Exact item
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Only the exact requested item is acceptable, no alternatives</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {preferences.exactSpecification && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="muted" className="flex items-center gap-1.5 cursor-help">
                              <Settings className="h-3.5 w-3.5" />
                              Exact specification
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Item must match all specified requirements exactly</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {preferences.exactPrice && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="muted" className="flex items-center gap-1.5 cursor-help">
                              <DollarSign className="h-3.5 w-3.5" />
                              Exact price
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Price must match the specified budget exactly</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                )}
              </div>
              {links?.length ? (
                <div className="space-y-2">
                  <p className="text-base font-semibold">Reference links</p>
                  <div className="space-y-1 text-base text-gray-600">
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

          {showSubmissionForm ? (
            <div>
              <SubmissionForm requestId={request.id} requestBudgetMax={request.budget_max} requestDescription={request.description} />
            </div>
          ) : null}
        </div>

        {/* Right Column: Submissions */}
        <div className="lg:col-span-2 space-y-6">
          <SubmissionList
            requestId={request.id}
            initialSubmissions={initialSubmissions}
            winnerId={request.winner_submission_id}
            canSelectWinner={isOwner}
            requestStatus={request.status}
          />
        </div>
      </div>

      {similarRequests && similarRequests.length > 0 ? (
        <div className="space-y-4 pt-12 mt-12 border-t border-[#e5e7eb]">
          <h2 className="text-2xl font-semibold">Similar requests</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similarRequests.map((similarRequest) => (
              <RequestCardGrid
                key={similarRequest.id}
                request={similarRequest}
                images={similarRequestImages[similarRequest.id] || []}
                isFavorite={similarRequestFavorites.has(similarRequest.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}


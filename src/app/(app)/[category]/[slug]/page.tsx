import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";
import { RequestDetailView } from "@/components/requests/request-detail-view";
import { extractIdFromSlug, createRequestUrl, extractSlugOnly } from "@/lib/utils/slug";
import { getCategoryName, getCategorySlug } from "@/lib/utils/category-routing";
import { Metadata } from "next";

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

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const categorySlug = decodeURIComponent(params.category);
  const slugWithId = decodeURIComponent(params.slug);
  const shortId = extractIdFromSlug(slugWithId);
  
  if (!shortId) return {};

  const supabase = await createServerSupabaseClient();
  const { data: request } = await supabase
    .from("requests")
    .select("title, description")
    .gte("id", `${shortId}-0000-0000-0000-000000000000`)
    .lte("id", `${shortId}-ffff-ffff-ffff-ffffffffffff`)
    .maybeSingle();

  if (!request) return {};

  // Clean description from metadata for SEO
  const cleanDescription = request.description.replace(/<!--REQUEST_PREFS:.*?-->/g, "").trim();
  const description = cleanDescription.length > 160 
    ? cleanDescription.substring(0, 157) + "..." 
    : cleanDescription;

  return {
    title: `${request.title} — Onseek`,
    description: description || `Check out this request on Onseek: ${request.title}`,
  };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const paramsResolved = await params;
  const categorySlug = decodeURIComponent(paramsResolved.category);
  const slugWithId = decodeURIComponent(paramsResolved.slug);
  const shortId = extractIdFromSlug(slugWithId);
  
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let request;
  if (shortId) {
    const { data } = await supabase
      .from("requests")
      .select("*, profiles(username, avatar_url, first_name, last_name)")
      .gte("id", `${shortId}-0000-0000-0000-000000000000`)
      .lte("id", `${shortId}-ffff-ffff-ffff-ffffffffffff`)
      .maybeSingle();
    request = data;
  }

  // Fallback: search by pure slug if new format fails or for legacy links
  if (!request) {
    const slugOnly = extractSlugOnly(slugWithId);
    const { data } = await supabase
      .from("requests")
      .select("*, profiles(username, avatar_url, first_name, last_name)")
      .eq("slug", slugOnly)
      .maybeSingle();
    request = data;
  }

  if (!request) {
    notFound();
  }

  // Redirect if category doesn't match or slug is old format
  const expectedCategorySlug = getCategorySlug(request.category || "all");
  const expectedUrl = createRequestUrl(request);
  
  // Normalize comparison to handle encoding and format changes
  if (categorySlug !== expectedCategorySlug || decodeURIComponent(expectedUrl) !== decodeURIComponent(`/${categorySlug}/${slugWithId}`)) {
    redirect(expectedUrl);
  }

  const id = request.id;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
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

  const { data: requestTags } = await supabase
    .from("request_tags")
    .select("tags(*)")
    .eq("request_id", id);
  
  const tags = requestTags?.map(rt => rt.tags).filter(Boolean) || [];

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, votes(vote, user_id), profiles(username, avatar_url, first_name, last_name)")
    .eq("request_id", id)
    .order("created_at", { ascending: false });

  const initialSubmissions =
    submissions?.map((item) => computeScore(item as Submission, user?.id)) ?? [];

  // Fetch similar requests (same category, exclude current request)
  const { data: similarRequests } = await supabase
    .from("requests")
    .select("*, profiles(username, avatar_url, first_name, last_name)")
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

  // Fetch tags for similar requests
  let similarRequestTags: Record<string, any[]> = {};
  if (similarRequests && similarRequests.length > 0) {
    const similarRequestIds = similarRequests.map((r) => r.id);
    const { data: sTags } = await supabase
      .from("request_tags")
      .select("request_id, tags(*)")
      .in("request_id", similarRequestIds);

    if (sTags) {
      sTags.forEach((st: any) => {
        if (st.tags) {
          if (!similarRequestTags[st.request_id]) {
            similarRequestTags[st.request_id] = [];
          }
          similarRequestTags[st.request_id].push(st.tags);
        }
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
      request={{ ...request, tags }}
      images={images || []}
      links={links || []}
      initialSubmissions={initialSubmissions}
      user={user}
      isOwner={isOwner}
      isAdmin={isAdmin}
      showSubmissionForm={showSubmissionForm}
      isFavorite={isFavorite}
      proposalCount={proposalCount}
      similarRequestImages={similarRequestImages}
      similarRequestSubmissionCounts={similarRequestSubmissionCounts}
      similarRequestFavorites={Array.from(similarRequestFavorites)}
      similarRequests={similarRequests?.map(r => ({ ...r, tags: similarRequestTags[r.id] || [] })) || []}
    />
  );
}

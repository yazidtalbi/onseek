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

  // Fetch everything else in parallel to avoid sequential waterfall
  const [
    linksRes,
    imagesRes,
    tagsRes,
    submissionsRes,
    similarRequestsRes,
    favoriteRes,
    adminRes
  ] = await Promise.all([
    supabase.from("request_links").select("*").eq("request_id", id),
    supabase.from("request_images").select("*").eq("request_id", id).order("image_order", { ascending: true }),
    supabase.from("request_tags").select("tags(*)").eq("request_id", id),
    supabase.from("submissions").select("*, votes(vote, user_id), profiles(username, avatar_url, first_name, last_name)").eq("request_id", id).order("created_at", { ascending: false }),
    supabase.from("requests").select("*, profiles(username, avatar_url, first_name, last_name)").eq("category", request.category).neq("id", id).order("created_at", { ascending: false }).limit(6),
    user ? supabase.from("favorites").select("id").eq("user_id", user.id).eq("request_id", id).maybeSingle() : Promise.resolve({ data: null }),
    user ? supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null })
  ]);

  const links = linksRes.data || [];
  const images = imagesRes.data || [];
  const requestTags = tagsRes.data || [];
  const tags = requestTags.map((rt: any) => rt.tags).filter(Boolean) || [];
  const submissions = submissionsRes.data || [];
  const similarRequests = similarRequestsRes.data || [];
  const isFavorite = !!favoriteRes?.data;
  const isAdmin = !!(adminRes?.data as any)?.is_admin;

  const initialSubmissions =
    submissions.map((item) => computeScore(item as Submission, user?.id)) ?? [];

  // Fetch detail metadata for similar requests in parallel
  let similarRequestImages: Record<string, string[]> = {};
  let similarRequestSubmissionCounts: Record<string, number> = {};
  let similarRequestFavorites: Set<string> = new Set();
  let similarRequestTags: Record<string, any[]> = {};

  if (similarRequests && similarRequests.length > 0) {
    const similarRequestIds = similarRequests.map((r) => r.id);
    
    const [
      sImagesRes,
      sSubmissionsRes,
      sFavoritesRes,
      sTagsRes
    ] = await Promise.all([
      supabase.from("request_images").select("request_id, image_url, image_order").in("request_id", similarRequestIds).order("image_order", { ascending: true }),
      supabase.from("submissions").select("request_id").in("request_id", similarRequestIds),
      user ? supabase.from("favorites").select("request_id").eq("user_id", user.id).in("request_id", similarRequestIds) : Promise.resolve({ data: [] }),
      supabase.from("request_tags").select("request_id, tags(*)").in("request_id", similarRequestIds)
    ]);

    // Process similar request images
    if (sImagesRes.data) {
      sImagesRes.data.forEach((img) => {
        if (!similarRequestImages[img.request_id]) {
          similarRequestImages[img.request_id] = [];
        }
        similarRequestImages[img.request_id].push(img.image_url);
      });
    }

    // Process submission counts
    if (sSubmissionsRes.data) {
      sSubmissionsRes.data.forEach((sub) => {
        const current = similarRequestSubmissionCounts[sub.request_id] || 0;
        similarRequestSubmissionCounts[sub.request_id] = current + 1;
      });
    }

    // Process favorites
    if (sFavoritesRes.data) {
      sFavoritesRes.data.forEach((fav: any) => {
        similarRequestFavorites.add(fav.request_id);
      });
    }

    // Process tags
    if (sTagsRes.data) {
      sTagsRes.data.forEach((st: any) => {
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

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MySubmissionsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, requests(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get unique request IDs from submissions
  const requestIds = submissions
    ?.map((sub) => (sub.requests as any)?.id)
    .filter((id) => id) || [];

  // Fetch full request data
  let requests: RequestItem[] = [];
  if (requestIds.length > 0) {
    const { data: requestsData } = await supabase
      .from("requests")
      .select("*")
      .in("id", requestIds);
    requests = (requestsData || []) as RequestItem[];
  }

  // Fetch images for requests
  let requestImages: Record<string, string[]> = {};
  if (requests.length > 0) {
    const { data: images } = await supabase
      .from("request_images")
      .select("request_id, image_url, image_order")
      .in("request_id", requests.map((r) => r.id))
      .order("image_order", { ascending: true });

    if (images) {
      images.forEach((img) => {
        if (!requestImages[img.request_id]) {
          requestImages[img.request_id] = [];
        }
        requestImages[img.request_id].push(img.image_url);
      });
    }
  }

  // Fetch links for requests
  let requestLinks: Record<string, string[]> = {};
  if (requests.length > 0) {
    const { data: links } = await supabase
      .from("request_links")
      .select("request_id, url")
      .in("request_id", requests.map((r) => r.id));

    if (links) {
      links.forEach((link) => {
        if (!requestLinks[link.request_id]) {
          requestLinks[link.request_id] = [];
        }
        requestLinks[link.request_id].push(link.url);
      });
    }
  }

  // Fetch submission counts
  let requestSubmissionCounts: Record<string, number> = {};
  if (requests.length > 0) {
    const { data: submissionCounts } = await supabase
      .from("submissions")
      .select("request_id")
      .in("request_id", requests.map((r) => r.id));

    if (submissionCounts) {
      submissionCounts.forEach((sub) => {
        const current = requestSubmissionCounts[sub.request_id] || 0;
        requestSubmissionCounts[sub.request_id] = current + 1;
      });
    }
  }

  // Fetch favorite status
  let requestFavorites: Set<string> = new Set();
  if (user && requests.length > 0) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("request_id")
      .eq("user_id", user.id)
      .in("request_id", requests.map((r) => r.id));

    if (favorites) {
      favorites.forEach((fav) => {
        requestFavorites.add(fav.request_id);
      });
    }
  }

  // Get unique requests (keep first occurrence of each request)
  const uniqueRequests = requests.filter(
    (request, index, self) => index === self.findIndex((r) => r.id === request.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My submissions</h1>
        <p className="text-sm text-muted-foreground">
          Track every link you have shared with the community.
        </p>
      </div>

      <div className="space-y-4">
        {uniqueRequests.length > 0 ? (
          uniqueRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={{
                ...request,
                submissionCount: requestSubmissionCounts[request.id] || 0,
              }}
              variant="feed"
              images={requestImages[request.id] || []}
              links={requestLinks[request.id] || []}
              isFavorite={requestFavorites.has(request.id)}
              isFirst={true}
              isLast={true}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white/50 p-6 text-center text-sm text-gray-600">
            No submissions yet. Explore requests and help find links.
          </div>
        )}
      </div>
    </div>
  );
}


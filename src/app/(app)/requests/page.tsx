import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequestFeed } from "@/components/requests/request-feed";
import { MyRequestsView } from "@/components/requests/my-requests-view";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
// Removed NewRequestButton import as the button has been removed from this page.

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
};

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch initial data (All) and counts in parallel
  const [
    { data: requests },
    { count: totalCount },
    { count: openCount },
    { count: solvedCount }
  ] = await Promise.all([
    supabase.from("requests").select("*, profiles(username, avatar_url, first_name, last_name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "open"),
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "solved")
  ]);

  const requestIds = requests?.map(r => r.id) || [];
  
  // Fetch details in parallel
  const [imagesRes, linksRes, submissionsRes] = await Promise.all([
    supabase.from("request_images").select("request_id, image_url, image_order").in("request_id", requestIds).order("image_order", { ascending: true }),
    supabase.from("request_links").select("request_id, url").in("request_id", requestIds),
    supabase.from("submissions").select("request_id").in("request_id", requestIds)
  ]);

  const submissionCountMap = new Map<string, number>();
  submissionsRes.data?.forEach((sub) => {
    const current = submissionCountMap.get(sub.request_id) || 0;
    submissionCountMap.set(sub.request_id, current + 1);
  });

  const imageMap = new Map<string, string[]>();
  imagesRes.data?.forEach((img) => {
    const existing = imageMap.get(img.request_id) || [];
    if (existing.length < 3) {
      existing.push(img.image_url);
      imageMap.set(img.request_id, existing);
    }
  });

  const linkMap = new Map<string, string[]>();
  linksRes.data?.forEach((link) => {
    const existing = linkMap.get(link.request_id) || [];
    existing.push(link.url);
    linkMap.set(link.request_id, existing);
  });

  const enrichedRequests = requests?.map((req) => ({
    ...req,
    images: imageMap.get(req.id) || [],
    links: linkMap.get(req.id) || [],
    submissionCount: submissionCountMap.get(req.id) || 0,
  })) || [];

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start justify-center">
        {/* Left Column: Header */}
        <div className="w-full md:w-[280px] shrink-0 space-y-6 sticky top-24">
          <div>
            <h1 className="text-4xl text-foreground" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>My Requests</h1>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Track your open requests, manage submissions, and find exactly what you're looking for.
            </p>
          </div>
        </div>

        {/* Right Column: Requests View (Client Component) */}
        <MyRequestsView
          initialRequests={(enrichedRequests as any) ?? []}
          totalCount={totalCount ?? 0}
          openCount={openCount ?? 0}
          solvedCount={solvedCount ?? 0}
        />
      </div>
    </div>
  );
}

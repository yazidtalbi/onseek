import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createRequestUrl } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const paramsResolved = await params;
  const slug = decodeURIComponent(paramsResolved.slug);
  const supabase = await createServerSupabaseClient();

  const { data: request } = await supabase
    .from("requests")
    .select("id, slug, category")
    .eq("slug", slug)
    .maybeSingle();

  if (!request) {
    // Try to find by ID if slug is actually an ID
    if (slug.length >= 8) {
      const shortId = slug.substring(0, 8);
      const { data: fallbackReq } = await supabase
        .from("requests")
        .select("id, slug, category")
        .gte("id", `${shortId}-0000-0000-0000-000000000000`)
        .lte("id", `${shortId}-ffff-ffff-ffff-ffffffffffff`)
        .maybeSingle();
        
      if (fallbackReq) {
        redirect(createRequestUrl(fallbackReq));
      }
    }
    notFound();
  }

  redirect(createRequestUrl(request));
}



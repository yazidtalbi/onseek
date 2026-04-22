import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";
import { Badge } from "@/components/ui/badge";
import AppLoading from "../../loading";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const adminSupabase = await createAdminSupabaseClient();

  // Fetch tag info
  const { data: tag, error } = await adminSupabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !tag) {
    console.error("Tag fetch error or not found:", error, tag);
    notFound();
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white text-2xl font-bold">
            #
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#1A1A1A] uppercase">
              {tag.name}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Explore all requests tagged with #{tag.slug}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[#7755FF]/10 text-[#7755FF] border-[#7755FF]/20 px-3 py-1 rounded-full font-bold">
            {tag.type.toUpperCase()} TAG
          </Badge>
        </div>
      </div>

      <Suspense fallback={<AppLoading />}>
        <TagFeedWrapper tagSlug={slug} />
      </Suspense>
    </div>
  );
}

async function TagFeedWrapper({ tagSlug }: { tagSlug: string }) {
  const initialData = await fetchInitialFeedData("latest", {
    tagSlug,
  });

  return (
    <PersonalizedFeed 
      initialMode="latest" 
      initialData={initialData} 
      hideFilters={true}
    />
  );
}

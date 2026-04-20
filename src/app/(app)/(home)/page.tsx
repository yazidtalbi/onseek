import { Suspense } from "react";
import AppLoading from "../loading";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";
import type { FeedMode } from "@/lib/types";
import { SvgTestSection } from "@/components/debug/svg-test-section";

export const dynamic = "force-dynamic";

type SearchParams = {
  mode?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  country?: string;
  sort?: string;
};

export default async function AppFeedPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const mode = (searchParams.mode === "for_you" ||
    searchParams.mode === "latest" ||
    searchParams.mode === "trending"
    ? searchParams.mode
    : "for_you") as FeedMode;

  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  return (
    <Suspense fallback={isLoggedIn ? <AppLoading /> : null}>
      <FeedDataWrapper mode={mode} searchParams={searchParams} />
    </Suspense>
  );
}

async function FeedDataWrapper({ mode, searchParams }: { mode: FeedMode, searchParams: SearchParams }) {
  const initialData = await fetchInitialFeedData(mode, {
    category: searchParams.category || null,
    priceMin: searchParams.priceMin || null,
    priceMax: searchParams.priceMax || null,
    country: searchParams.country || null,
    sort: searchParams.sort || null,
  });

  return (
    <div className="flex flex-col gap-8">
      <PersonalizedFeed initialMode={mode} initialData={initialData} />
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-6 mb-12">
        <SvgTestSection />
      </div>
    </div>
  );
}


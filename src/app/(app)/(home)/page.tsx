import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";
import type { FeedMode } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  mode?: string;
  category?: string;
  priceMin?: string;
  priceMax?: string;
  country?: string;
  sort?: string;
};

import { Suspense } from "react";
import AppLoading from "../loading";

export default async function AppFeedPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const mode = (searchParams.mode === "for_you" ||
    searchParams.mode === "latest" ||
    searchParams.mode === "trending"
    ? searchParams.mode
    : "for_you") as FeedMode;

  return (
    <Suspense fallback={<AppLoading />}>
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
    <PersonalizedFeed initialMode={mode} initialData={initialData} />
  );
}


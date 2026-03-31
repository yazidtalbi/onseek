import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function PopularPage({ searchParams }: { searchParams: any }) {
  const mode = "trending";
  const initialData = await fetchInitialFeedData(mode, {
    ...searchParams,
  });

  return <PersonalizedFeed initialMode={mode} initialData={initialData} />;
}

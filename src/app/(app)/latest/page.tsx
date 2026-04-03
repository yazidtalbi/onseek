import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function LatestPage({ searchParams }: { searchParams: any }) {
  const mode = "latest";
  const initialData = await fetchInitialFeedData(mode, {
    ...searchParams,
  });

  return <PersonalizedFeed initialMode={mode} initialData={initialData} />;
}

import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function ForYouPage({ searchParams }: { searchParams: any }) {
  const mode = "for_you";
  const initialData = await fetchInitialFeedData(mode, {
    ...searchParams,
  });

  return <PersonalizedFeed initialMode={mode} initialData={initialData} />;
}

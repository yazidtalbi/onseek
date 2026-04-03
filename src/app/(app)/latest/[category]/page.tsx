import { notFound } from "next/navigation";
import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";
import { getCategoryName } from "@/lib/utils/category-routing";

export const dynamic = "force-dynamic";

export default async function LatestCategoryPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ category: string }>;
  searchParams: any;
}) {
  const { category: slug } = await params;
  const categoryName = getCategoryName(slug);
  
  if (!categoryName) return notFound();

  const mode = "latest";
  const initialData = await fetchInitialFeedData(mode, {
    ...searchParams,
    category: categoryName,
  });

  return <PersonalizedFeed initialMode={mode} initialCategory={categoryName} initialData={initialData} />;
}

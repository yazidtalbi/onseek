import { notFound } from "next/navigation";
import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { fetchInitialFeedData } from "@/lib/feed";
import { getCategoryName } from "@/lib/utils/category-routing";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await props.params;
  const categoryName = getCategoryName(slug);

  if (!categoryName) return {};

  return {
    title: `${categoryName} — Onseek`,
    description: `Explore the latest requests and submissions in the ${categoryName} category on Onseek.`,
    alternates: {
      canonical: `https://onseek.co/${slug}`,
    },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>;
  searchParams: Promise<any>;
}) {
  const { category: slug } = await props.params;
  const searchParams = await props.searchParams;
  const categoryName = getCategoryName(slug);

  if (!categoryName) return notFound();

  const mode = "trending";
  const initialData = await fetchInitialFeedData(mode, {
    ...searchParams,
    category: categoryName,
  });

  return <PersonalizedFeed initialMode={mode} initialCategory={categoryName} initialData={initialData} />;
}

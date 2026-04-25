import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { fetchInitialFeedData } from "@/lib/feed";
import { RequestCard } from "@/components/requests/request-card";
import { TagBadge } from "@/components/ui/tag-badge";
import { IconHash, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const adminSupabase = await createAdminSupabaseClient();
  
  const { data: tag } = await adminSupabase
    .from("tags")
    .select("name")
    .ilike("slug", slug)
    .single();

  if (!tag) {
    return {
      title: "Tag Not Found | Onseek",
    };
  }

  return {
    title: `${tag.name} Requests | Onseek`,
    description: `Explore all marketplace requests tagged with #${slug} on Onseek.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const adminSupabase = await createAdminSupabaseClient();

  // Fetch tag info
  const { data: tag, error } = await adminSupabase
    .from("tags")
    .select("*")
    .ilike("slug", slug)
    .single();

  if (error || !tag) {
    console.error(`[TagPage] Error fetching tag ${slug}:`, error);
    notFound();
  }

  // Fetch requests directly in the page to ensure visibility
  const { items: requests } = await fetchInitialFeedData("latest", {
    tagSlug: slug,
  });

  // Extract related tags from the requests shown (max 5)
  const tagsFromRequests = requests.flatMap((r: any) => r.tags || []);
  const relatedTags = Array.from(new Map(tagsFromRequests.map((t: any) => [t.id, t])).values())
    .filter((t: any) => t.slug !== slug)
    .slice(0, 5);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-0 pb-8 md:pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-10 text-[13px] font-semibold text-gray-900">
        <Link href="/" className="hover:underline">Explore</Link>
        <IconChevronRight className="w-3.5 h-3.5 text-gray-400" stroke={3} />
        <Link href="/tags" className="hover:underline">Tags</Link>
        <IconChevronRight className="w-3.5 h-3.5 text-gray-400" stroke={3} />
        <div className="px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
          {tag.name}
        </div>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
          {tag.name}
        </h1>
        
        <p className="text-[#1A1A1A] text-xl font-medium max-w-3xl leading-snug mb-4">
          Discover exactly what seekers are looking for in <span className="font-bold">{tag.name}</span>. Browse curated requests, explore market demand, and skip the search on Onseek.
        </p>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-10">
          <span>{requests.length * 12 + 450} people searched this</span>
          <span className="text-gray-300">·</span>
          <span>{requests.length} {requests.length === 1 ? 'Request' : 'Requests'}</span>
          <span className="text-gray-300">·</span>
          <span>Last updated {new Date(tag.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
        </div>

        {relatedTags && relatedTags.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {relatedTags.map((rt) => (
              <Link 
                key={rt.slug}
                href={`/tags/${rt.slug}`} 
                className="px-5 py-2.5 bg-[#E9E9E9] hover:bg-[#DEDEE0] rounded-full text-[15px] font-bold text-gray-900 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span className="text-gray-500 text-lg">#</span> {rt.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {requests.map((request: any) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                images={request.images}
                links={request.links}
                variant="detail"
                isMasonry={true}
                smallImages={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-[#F9F9F9] rounded-3xl border-2 border-dashed border-[#EEEEEE]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <IconHash className="w-10 h-10 text-[#CCCCCC]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">No requests yet</h3>
            <p className="text-[#666666] max-w-md mx-auto">
              Be the first to create a request with the <span className="font-bold text-[#1A1A1A]">#{tag.slug}</span> tag!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

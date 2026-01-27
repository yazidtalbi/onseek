import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PersonalizedFeed } from "@/components/requests/personalized-feed";
import { RequestInputSection } from "@/components/requests/request-input-section";
import { PromotionalSidebar } from "@/components/requests/promotional-sidebar";
import type { FeedMode } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  mode?: string;
};

export default async function AppFeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const mode = (searchParams.mode === "for_you" || 
                searchParams.mode === "latest" || 
                searchParams.mode === "trending"
    ? searchParams.mode
    : "for_you") as FeedMode;

  return (
    <div className="space-y-8">
      {/* Main Content: Requests on Left, Sidebar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requests Feed (8/12 width) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Hero Section */}
          <div id="hero-search-section" className="space-y-6 pb-8 max-w-4xl">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-semibold text-left">
                Explore
              </h1>
            </div>
            {/* Request Input Section */}
            <div className="w-full">
              <RequestInputSection />
            </div>
          </div>
          <PersonalizedFeed initialMode={mode} />
        </div>

        {/* Right Column: Promotional Sidebar (4/12 width) */}
        <div className="lg:col-span-4">
          <PromotionalSidebar />
        </div>
      </div>

    </div>
  );
}


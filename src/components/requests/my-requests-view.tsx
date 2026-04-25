"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface MyRequestsViewProps {
  initialRequests: RequestItem[];
  totalCount: number;
  openCount: number;
  solvedCount: number;
}

export function MyRequestsView({
  initialRequests,
  totalCount,
  openCount,
  solvedCount
}: MyRequestsViewProps) {
  const [status, setStatus] = useState<"all" | "open" | "solved">("all");

  const { data: allRequests, isLoading } = useQuery({
    queryKey: ["all-my-requests"],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from("requests")
        .select("*, profiles(username, avatar_url, first_name, last_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !requests) return [];

      const requestIds = requests.map((r) => r.id);
      
      // Fetch details in parallel
      const [imagesRes, linksRes, submissionsRes] = await Promise.all([
        supabase.from("request_images").select("request_id, image_url, image_order").in("request_id", requestIds).order("image_order", { ascending: true }),
        supabase.from("request_links").select("request_id, url").in("request_id", requestIds),
        supabase.from("submissions").select("request_id").in("request_id", requestIds)
      ]);

      const submissionCountMap = new Map<string, number>();
      submissionsRes.data?.forEach((sub) => {
        const current = submissionCountMap.get(sub.request_id) || 0;
        submissionCountMap.set(sub.request_id, current + 1);
      });

      const imageMap = new Map<string, string[]>();
      imagesRes.data?.forEach((img) => {
        const existing = imageMap.get(img.request_id) || [];
        if (existing.length < 3) {
          existing.push(img.image_url);
          imageMap.set(img.request_id, existing);
        }
      });

      const linkMap = new Map<string, string[]>();
      linksRes.data?.forEach((link) => {
        const existing = linkMap.get(link.request_id) || [];
        existing.push(link.url);
        linkMap.set(link.request_id, existing);
      });

      return requests.map((req) => ({
        ...req,
        images: imageMap.get(req.id) || [],
        links: linkMap.get(req.id) || [],
        submissionCount: submissionCountMap.get(req.id) || 0,
      }));
    },
    initialData: initialRequests,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredRequests = allRequests?.filter(req => {
    if (status === "all") return true;
    return req.status === status;
  }) || [];

  return (
    <div className="flex-1 w-full max-w-[420px]">
      {/* Tabs Navigation (Pills) */}
      <div className="flex items-center gap-1 mb-10 w-fit">
        <button
          onClick={() => setStatus("all")}
          className={cn(
            "px-6 py-2 text-[14px] font-bold transition-all rounded-full whitespace-nowrap",
            status === "all" ? "bg-[#7755FF]/10 text-[#7755FF]" : "text-gray-400 hover:text-gray-900"
          )}
        >
          All <span className={cn("ml-0.5 font-medium", status === "all" ? "text-[#7755FF]/60" : "opacity-40")}>{totalCount}</span>
        </button>
        <button
          onClick={() => setStatus("open")}
          className={cn(
            "px-6 py-2 text-[14px] font-bold transition-all rounded-full whitespace-nowrap",
            status === "open" ? "bg-[#7755FF]/10 text-[#7755FF]" : "text-gray-400 hover:text-gray-900"
          )}
        >
          Open <span className={cn("ml-0.5 font-medium", status === "open" ? "text-[#7755FF]/60" : "opacity-40")}>{openCount}</span>
        </button>
        <button
          onClick={() => setStatus("solved")}
          className={cn(
            "px-6 py-2 text-[14px] font-bold transition-all rounded-full whitespace-nowrap",
            status === "solved" ? "bg-[#7755FF]/10 text-[#7755FF]" : "text-gray-400 hover:text-gray-900"
          )}
        >
          Solved <span className={cn("ml-0.5 font-medium", status === "solved" ? "text-[#7755FF]/60" : "opacity-40")}>{solvedCount}</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {filteredRequests.map((request: any, index: number) => (
          <div
            key={request.id}
            className="rounded-[20px] transition-all duration-300 ease-out"
          >
            <RequestCard
              request={request}
              variant="detail"
              images={request.images || []}
              links={request.links || []}
              isFirst={index === 0}
              isLast={index === filteredRequests.length - 1}
              smallImages={true}
              noBorder={true}
              disableHover={true}
            />
          </div>
        ))}
        {filteredRequests.length === 0 && !isLoading && (
          <div className="rounded-lg border border-dashed border-[#e5e7eb] p-8 text-center text-sm text-gray-600">
            No requests found in this category.
          </div>
        )}
      </div>
    </div>
  );
}


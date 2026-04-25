"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RequestCard } from "@/components/requests/request-card";
import { SubmissionCard } from "@/components/submissions/submission-card";
import Link from "next/link";
import { createRequestUrl } from "@/lib/utils/slug";
import type { Submission } from "@/lib/types";

interface MySubmissionsViewProps {
  initialSubmissions: any[];
  requestOwnerIds: Record<string, string>;
}

export function MySubmissionsView({
  initialSubmissions,
  requestOwnerIds
}: MySubmissionsViewProps) {
  const [status, setStatus] = useState<"all" | "winner" | "pending">("all");

  const filteredSubmissions = initialSubmissions.filter(sub => {
    if (status === "all") return true;
    if (status === "winner") return sub.is_winner === true;
    if (status === "pending") return sub.is_winner !== true;
    return true;
  });

  const totalCount = initialSubmissions.length;
  const winnerCount = initialSubmissions.filter(s => s.is_winner === true).length;

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
          onClick={() => setStatus("winner")}
          className={cn(
            "px-6 py-2 text-[14px] font-bold transition-all rounded-full whitespace-nowrap",
            status === "winner" ? "bg-[#7755FF]/10 text-[#7755FF]" : "text-gray-400 hover:text-gray-900"
          )}
        >
          Winner <span className={cn("ml-0.5 font-medium", status === "winner" ? "text-[#7755FF]/60" : "opacity-40")}>{winnerCount}</span>
        </button>
      </div>

      <div className="flex flex-col gap-12 w-full">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission, index) => {
            const request = (submission as any).requests;
            const requestId = request?.id;
            const requestTitle = request?.title;
            
            return (
              <div key={submission.id} className="relative mb-12 group">
                <div className="space-y-3 relative z-10">
                  <div className="flex items-baseline px-1 gap-1">
                    <span className="text-[13px] font-semibold text-neutral-500 whitespace-nowrap">Your proposal for</span>
                    {requestId && requestTitle && (
                      <Link
                        href={createRequestUrl({ id: requestId })}
                        className="text-[13px] text-[#7755FF] hover:underline font-bold line-clamp-1"
                      >
                        {requestTitle}
                      </Link>
                    )}
                  </div>
                  
                  <div className="relative">
                    {/* Parse preferences for SubmissionCard */}
                    {(() => {
                      const description = request?.description || "";
                      const match = description.match(/<!--REQUEST_PREFS:({.*?})-->/);
                      let prefs: any[] = [];
                      let deals: any[] = [];
                      
                      if (match) {
                        try {
                          const parsed = JSON.parse(match[1]);
                          prefs = parsed.preferences || [];
                          deals = parsed.dealbreakers || [];
                        } catch (e) {}
                      }

                      return (
                        <SubmissionCard
                          submission={submission}
                          requestId={requestId || ""}
                          requestTitle={requestTitle}
                          isFirst={false}
                          isLast={false}
                          isOnlyOne={true}
                          requestOwnerId={requestId ? requestOwnerIds[requestId] : undefined}
                          hideVotes={true}
                          viewMode="compact"
                          hideFooter={true}
                          requestPreferences={prefs}
                          requestDealbreakers={deals}
                        />
                      );
                    })()}

                    {/* Request Preview Card (Miniature Scale 0.25) */}
                    {request && (
                      <div className="absolute -bottom-4 -right-4 w-[400px] z-20 scale-[0.25] origin-bottom-right pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white rounded-[32px] shadow-2xl border-[6px] border-[#7755FF] overflow-hidden pointer-events-auto">
                          <RequestCard 
                            request={request} 
                            variant="detail" 
                            isPreview={true} 
                            disableHover={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e5e7eb] p-10 text-center text-sm text-gray-500">
            No proposals found in this category.
          </div>
        )}
      </div>
    </div>
  );
}

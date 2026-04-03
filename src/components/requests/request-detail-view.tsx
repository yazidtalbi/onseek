"use client";

import Link from "next/link";
import type { Submission, RequestItem } from "@/lib/types";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { RequestCard } from "@/components/requests/request-card";
import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/requests/share-button";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

interface RequestDetailViewProps {
  // ... (props stay the same)
  request: any;
  images: any[];
  links: any[];
  initialSubmissions: Submission[];
  user: any;
  isOwner: boolean;
  showSubmissionForm: boolean;
  isFavorite: boolean;
  proposalCount: number;
  similarRequests?: any[];
  similarRequestImages?: Record<string, string[]>;
  similarRequestSubmissionCounts?: Record<string, number>;
  similarRequestFavorites?: string[];
  isModal?: boolean;
}

export function RequestDetailView({
  request,
  images,
  links,
  initialSubmissions,
  user,
  isOwner,
  showSubmissionForm,
  isFavorite,
  proposalCount,
  similarRequests,
  similarRequestImages = {},
  similarRequestSubmissionCounts = {},
  similarRequestFavorites = [],
  isModal = false,
}: RequestDetailViewProps) {
  return (
    <div className="w-full space-y-6">
      {/* Centered Content: Request & Proposals */}
      <div className="max-w-[1360px] mx-auto w-full px-4 md:px-6 space-y-6">
        {/* Back Button and Breadcrumbs - Hide in modal as it has its own navigation */}
        {!isModal && (
          <div className="flex items-center gap-4">
            <BackButton />
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link
                href={`/category/${request.category.toLowerCase()}`}
                className="hover:text-foreground transition-colors text-foreground font-medium"
              >
                {request.category}
              </Link>
            </nav>
          </div>
        )}

        {/* Two Column Layout: Request on Left, Submissions on Right */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start relative pb-24 sm:pb-0">
          {/* Left Column: Request Details - Sticky on scroll */}
          <div className={cn(
            "w-full lg:w-[55%] space-y-6 flex-shrink-0 self-start lg:sticky lg:top-20"
          )}>
            <RequestCard
              request={request}
              variant="detail"
              isFavorite={isFavorite}
              images={images?.map((img: any) => img.image_url) || []}
              links={links?.map((link: any) => link.url) || []}
              proposalCount={proposalCount}
              noBorder={true}
              noPadding={true}
              noRounding={true}
            />
          </div>

          {/* Right Column: Proposals */}
          <div className="flex-1 space-y-8 min-w-0">
            <div className="space-y-6">
              {/* Action Buttons: Share, Save, Report */}
              <div className="flex items-center justify-between gap-4">
                <ShareButton requestId={request.id} />

                <div className="flex items-center gap-2">
                  <div className="p-0.5 border border-gray-100 rounded-full">
                    <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
                  </div>

                  <button
                    className="flex items-center justify-center w-11 h-11 rounded-full border border-gray-100 text-gray-500 hover:text-gray-900 transition-colors bg-white active:scale-95"
                    onClick={() => alert("Report feature coming soon!")}
                    title="Report request"
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">

                {showSubmissionForm && !isOwner ? (
                  <div className="hidden sm:block">
                    <SubmissionForm
                      requestId={request.id}
                      requestBudgetMax={request.budget_max}
                      requestDescription={request.description}
                      hideButton={proposalCount === 0}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <SubmissionList
              requestId={request.id}
              requestTitle={request.title}
              initialSubmissions={initialSubmissions}
              winnerId={request.winner_submission_id}
              canSelectWinner={isOwner}
              requestStatus={request.status}
              requestOwnerId={request.user_id}
              hideTitle={true}
            />
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar (Submit Proposal & Save) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 flex sm:hidden items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {showSubmissionForm && !isOwner ? (
            <div className="flex-1">
              <SubmissionForm
                requestId={request.id}
                requestBudgetMax={request.budget_max}
                requestDescription={request.description}
                hideButton={proposalCount === 0}
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex items-center justify-center w-[40px] h-[40px] rounded-full shrink-0 border border-gray-200 bg-white shadow-sm">
            <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
          </div>
        </div>
      </div>

      {similarRequests && similarRequests.length > 0 && (
        <div className="max-w-[1360px] mx-auto w-full space-y-4 pt-12 mt-12 px-4 md:px-6">
          <h2 className="text-2xl font-semibold text-foreground">Similar requests</h2>
          <div className="columns-[360px] gap-6">
            {similarRequests.map((similarRequest) => (
              <div key={similarRequest.id} className="break-inside-avoid mb-6 bg-[#f5f6f9] rounded-[20px] p-[6px] transition-all duration-300 ease-out hover:-translate-y-1.5 shadow-none hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]">
                <RequestCard
                  request={{
                    ...similarRequest,
                    submissionCount: similarRequestSubmissionCounts[similarRequest.id] || 0,
                  }}
                  variant="detail"
                  smallImages={true}
                  images={similarRequestImages[similarRequest.id] || []}
                  isFavorite={similarRequestFavorites.includes(similarRequest.id)}
                  noBorder={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

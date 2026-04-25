"use client";

import Link from "next/link";
import type { Submission, RequestItem } from "@/lib/types";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SubmissionForm } from "@/components/submissions/submission-form";
import { RequestCard } from "@/components/requests/request-card";
import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/requests/share-button";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle2, X, Clock, Archive, Check, Sparkles, MapPin, Gauge } from "lucide-react";
import { approveRequestAction, rejectRequestAction, archiveRequestAction } from "@/actions/request.actions";
import { useToast } from "@/components/ui/use-toast";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/reports/report-dialog";
import { formatBudget } from "@/lib/utils/format";
import Image from "next/image";
import { formatFullName } from "@/lib/utils/name";

function cleanDescription(description: string) {
  return description.replace(/<!--REQUEST_PREFS:.*?-->/, "").trim();
}

function parseRequestPreferences(description: string) {
  const match = description.match(/<!--REQUEST_PREFS:({.*?})-->/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

interface RequestDetailViewProps {
  request: any;
  images: any[];
  links: any[];
  initialSubmissions: Submission[];
  user: any;
  isOwner: boolean;
  isAdmin?: boolean;
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
  isAdmin = false,
  showSubmissionForm,
  isFavorite,
  proposalCount,
  similarRequests,
  similarRequestImages = {},
  similarRequestSubmissionCounts = {},
  similarRequestFavorites = [],
  isModal = false,
}: RequestDetailViewProps) {
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = React.useState(false);

  const parsedPrefs = parseRequestPreferences(request.description) || {
    preferences: [],
    dealbreakers: [],
  };

  const preferences = parsedPrefs.preferences || [];
  const dealbreakers = parsedPrefs.dealbreakers || [];
  const cleanDesc = cleanDescription(request.description);
  const budgetText = formatBudget(request.budget_min, request.budget_max);

  return (
    <div className="w-full pb-20">
      {/* Centered Content: Request & Proposals */}
      <div className={cn("max-w-[850px] w-full px-4 md:px-8", !isModal ? "ml-0" : "mx-auto")}>

        {/* Header Navigation & Actions */}
        {!isModal && (
          <div className="flex items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <BackButton />
              <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link
                  href={`/category/${request.category.toLowerCase()}`}
                  className="hover:text-black transition-colors font-medium"
                >
                  {request.category}
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <ShareButton requestId={request.id} />
              <div className="p-0.5 border border-gray-100 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow">
                <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
              </div>
              <button
                type="button"
                className="flex items-center justify-center p-2.5 rounded-full border border-gray-100 bg-white shadow-sm hover:bg-red-50 hover:text-red-500 transition-all text-gray-400"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STACKED LAYOUT START */}
        <div className="space-y-10">

          {/* TOP SECTION: CUSTOM PREMIUM HEADER */}
          <section className="space-y-6 relative">
            {/* Title & Category Row */}
            <div className="space-y-6 max-w-5xl">

              <h1 className="text-4xl md:text-6xl font-black text-black leading-[1.05]" style={{ fontFamily: 'var(--font-expanded)' }}>
                {request.title}
              </h1>

              {cleanDesc && (
                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-3xl">
                  {cleanDesc}
                </p>
              )}
            </div>

            {/* Meta Row (Location, Condition, Budget) */}
            <div className="flex flex-wrap items-start gap-12 lg:gap-20 py-4">
              {request.country && (
                <div className="space-y-2">
                  <span className="text-[13px] font-medium text-gray-500" style={{ fontFamily: 'var(--font-inter-display)' }}>Location</span>
                  <div className="flex items-center gap-2 text-[17px] font-bold text-black">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{request.country}</span>
                  </div>
                </div>
              )}
              {request.condition && (
                <div className="space-y-2">
                  <span className="text-[13px] font-medium text-gray-500" style={{ fontFamily: 'var(--font-inter-display)' }}>
                    {(() => {
                      const c = (request.category || "").toLowerCase();
                      if (c.includes("service") || c.includes("learning") || c.includes("artisanat")) return "Expertise";
                      if (c.includes("travel") || c.includes("property") || c.includes("experiences") || c.includes("digital") || c.includes("finance")) return "Type";
                      return "Condition";
                    })()}
                  </span>
                  <div className="flex items-center gap-2 text-[17px] font-bold text-black capitalize">
                    <Gauge className="h-4 w-4 text-gray-400" />
                    <span>{request.condition === 'any' ? 'Any Condition' : request.condition}</span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <span className="text-[13px] font-medium text-gray-500" style={{ fontFamily: 'var(--font-inter-display)' }}>Budget</span>
                <div className="flex items-center gap-2 text-[17px] font-bold text-black">
                  <span className="text-sm text-gray-400 font-black">$</span>
                  <span>{request.budget_min ? `${request.budget_min}${request.budget_max ? ` - ${request.budget_max}` : ''}` : "Negotiable"}</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="space-y-2 ml-auto lg:text-right hidden sm:block">
                <span className="text-[13px] font-medium text-gray-500" style={{ fontFamily: 'var(--font-inter-display)' }}>Posted By</span>
                <div className="flex items-center gap-3 justify-end">
                  <span className="text-lg font-bold text-black">{formatFullName(request.profiles?.first_name, request.profiles?.last_name, request.profiles?.username || "Anonymous")}</span>
                  <div className="w-10 h-10 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 relative">
                    {request.profiles?.avatar_url ? (
                      <Image src={request.profiles.avatar_url} alt="avatar" fill className="object-cover" />
                    ) : (request.profiles?.first_name?.charAt(0) || request.profiles?.username?.charAt(0) || 'U').toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* HORIZONTAL REQUIREMENTS SECTION - REFINED WITH ICONS & SEPARATOR */}
            {(preferences.length > 0 || dealbreakers.length > 0) && (
              <div className="py-10">
                <div className="flex flex-col md:flex-row gap-16 md:gap-0">
                  {/* Preferences Column */}
                  {preferences.length > 0 && (
                    <div className={cn(
                      "flex-1 space-y-6",
                      dealbreakers.length > 0 && "md:pr-16 md:border-r border-gray-100"
                    )}>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-gray-500" style={{ fontFamily: 'var(--font-inter-display)' }}>Preferences</span>
                      </div>
                      <div className="flex flex-col gap-5">
                        {preferences.map((pref: any, i: number) => (
                          <div key={i} className="flex items-start gap-4 text-[17px] font-semibold text-[#1A1A1A]">
                            <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                            <span>{pref.label || pref}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dealbreakers Column */}
                  {dealbreakers.length > 0 && (
                    <div className={cn(
                      "flex-1 space-y-6",
                      preferences.length > 0 && "md:pl-16"
                    )}>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-gray-500" style={{ fontFamily: 'var(--font-inter-display)' }}>Dealbreakers</span>
                      </div>
                      <div className="flex flex-col gap-5">
                        {dealbreakers.map((deal: any, i: number) => (
                          <div key={i} className="flex items-start gap-4 text-[17px] font-semibold text-black/40">
                            <X className="h-5 w-5 text-black/20 shrink-0 mt-0.5" strokeWidth={3} />
                            <span>{deal.label || deal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images Gallery */}
            {images.length > 0 && (
              <div className="space-y-4 pt-4">
                <span className="text-[13px] font-bold text-gray-400" style={{ fontFamily: 'var(--font-expanded)' }}>Reference Images</span>
                <div className="flex flex-wrap gap-4">
                  {images.map((img: any, i: number) => (
                    <div key={i} className="relative w-32 h-32 rounded-3xl overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-all">
                      <Image src={img.image_url} alt="ref" fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            {/* Tags */}
            {request.tags && request.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-10">
                {request.tags.map((tag: any, i: number) => {
                  const tagLabel = typeof tag === 'object' ? tag.name : String(tag);
                  const tagSlug = typeof tag === 'object' ? tag.slug : tagLabel.replace(/\s+/g, '-').toLowerCase();
                  return (
                    <Link 
                      key={i} 
                      href={`/tags/${tagSlug}`}
                      className="text-[13px] font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 hover:text-[#6925DC] hover:border-[#6925DC]/20 transition-colors cursor-pointer"
                    >
                      #{tagLabel.replace(/\s+/g, '-').toLowerCase()}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* ACTION SECTION: SUBMISSION FORM (CLEAN INPUT) */}
          {showSubmissionForm && !isOwner && (
            <div className={cn("max-w-4xl w-full", !isModal ? "ml-0" : "mx-auto")}>
              <SubmissionForm
                requestId={request.id}
                requestBudgetMax={request.budget_max}
                requestDescription={request.description}
                hideButton={proposalCount === 0}
              />
            </div>
          )}

          {/* BOTTOM SECTION: PROPOSALS FEED */}
          <section className="space-y-6 w-full pt-10 border-t border-gray-100">
            <div className="w-full">
              <SubmissionList
                requestId={request.id}
                requestTitle={request.title}
                initialSubmissions={initialSubmissions}
                winnerId={request.winner_submission_id}
                canSelectWinner={isOwner}
                requestStatus={request.status}
                requestOwnerId={request.user_id}
                hideTitle={true}
                largeText={true}
                isOwner={isOwner}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex sm:hidden items-center gap-3 shadow-lg" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {showSubmissionForm && !isOwner ? (
          <div className="flex-1">
            <Button className="w-full h-14 rounded-2xl bg-[#6925DC] text-white font-black text-lg shadow-xl shadow-[#6925DC]/20">
              Submit Proposal
            </Button>
          </div>
        ) : (
          <div className="flex-1 text-center font-bold text-gray-500">View Marketplace</div>
        )}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-200 bg-white shadow-sm">
          <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
        </div>
      </div>

      {/* Similar Requests */}
      {similarRequests && similarRequests.length > 0 && (
        <div className="mt-24 py-24">
          <div className="max-w-[1360px] ml-0 w-full space-y-8 px-4 md:px-8">
            <h2 className="text-3xl font-black text-black leading-none" style={{ fontFamily: 'var(--font-expanded)' }}>You might also like</h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
              {similarRequests.map((similarRequest) => (
                <div key={similarRequest.id} className="break-inside-avoid mb-8 bg-white border border-gray-100 rounded-[2.5rem] p-2 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/5">
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
        </div>
      )}

      <ReportDialog
        type="request"
        targetId={request.id}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
    </div>
  );
}

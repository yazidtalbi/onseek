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
import { formatTimeAgo } from "@/lib/utils/time";
import { toggleFavoriteAction } from "@/actions/favorite.actions";
import Image from "next/image";

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

  const similarRequestsRef = React.useRef<HTMLDivElement>(null);
  const [hideBottomBar, setHideBottomBar] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHideBottomBar(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (similarRequestsRef.current) {
      observer.observe(similarRequestsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full pb-20">
      {/* Centered Content: Request & Proposals */}
      <div className={cn("max-w-[1360px] w-full px-3 md:px-12 mx-auto")}>

        {/* Header Navigation & Actions moved inside centered container */}
        {!isModal && (
          <div className="flex items-center justify-between gap-4 mb-2 md:mb-6 pt-0 md:pt-2">
            <div className="flex items-center gap-4">
              <BackButton />
              <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-black transition-colors font-medium">Home</Link>
                <span>/</span>
                <Link href="/requests" className="hover:text-black transition-colors font-medium">Requests</Link>
                <span>/</span>
                <Link
                  href={`/category/${request.category.toLowerCase()}`}
                  className="hover:text-black transition-colors font-medium"
                >
                  {request.category}
                </Link>
              </nav>
            </div>

          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start relative pb-20">
          
          {/* LEFT COLUMN: REQUEST CARD SIDEBAR (480px, sticky) */}
          <aside className="w-full lg:w-[480px] lg:sticky lg:top-24 space-y-6 shrink-0 h-fit pb-12">
            
            {/* EXTERNAL HEADER: Avatar, Date, Icon, Status */}
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-full overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-gray-50 text-[14px] font-bold text-gray-400 relative">
                    {request.profiles?.avatar_url ? (
                      <Image src={request.profiles.avatar_url} alt={request.profiles?.username || 'user'} fill className="object-cover" sizes="40px" />
                    ) : (
                      (request.profiles?.username?.charAt(0) || 'U').toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1A1A1A] text-[16px]">
                      {request.profiles?.username || "Account"}
                    </span>
                    <span className="text-gray-400 text-[13px]">
                      Requested {formatTimeAgo(request.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RequestMenu 
                    requestId={request.id}
                    requestUserId={request.user_id}
                    status={request.status}
                    isAdmin={isAdmin}
                    isFavorite={isFavorite}
                    onToggleFavorite={async () => {
                      const formData = new FormData();
                      formData.set("requestId", request.id);
                      await toggleFavoriteAction(formData);
                    }}
                  />
                </div>
              </div>
            </div>

            <RequestCard
              request={{
                ...request,
                submissionCount: proposalCount,
              }}
              variant="detail"
              smallImages={true}
              images={images.map(img => img.image_url)}
              links={links.map(l => l.url)}
              isFavorite={isFavorite}
              noBorder={true}
              hideAuthOverlay={true}
              isLarge={true}
              hideTags={true}
              disableHover={true}
            />

            {/* Status & Location Row */}
            <div className="flex items-start gap-12 pt-4">
              {/* Status Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[14px] font-bold text-black/30">Status</h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full font-bold border shadow-none px-4 py-1.5 text-[14px] bg-white",
                      request.status === "solved" ? "border-emerald-100 text-emerald-600" : "border-[#6925DC]/20 text-[#6925DC]"
                    )}
                  >
                    {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Location Section */}
              {(request.profiles?.country || request.country) && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-[14px] font-bold text-black/30">Location</h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full font-bold border shadow-none px-4 py-1.5 text-[14px] bg-white border-gray-100 text-[#1A1A1A]"
                    >
                      {request.profiles?.country || request.country}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION: Submit Proposal Button (Desktop) */}
            {showSubmissionForm && !isOwner && (
              <div className="hidden md:block pt-2">
                <Button 
                  className="w-full h-12 rounded-full bg-[#6925DC] text-white font-bold text-[15px] shadow-none hover:bg-[#6925DC]/90 transition-all"
                  onClick={() => {
                    if (typeof (window as any).openSubmissionModal === 'function') {
                      (window as any).openSubmissionModal();
                    } else {
                      const trigger = document.getElementById('submission-form-trigger');
                      if (trigger) trigger.click();
                    }
                  }}
                >
                  Submit Proposal
                </Button>
              </div>
            )}

            {/* Automated Tags moved outside card */}
            {request.tags && request.tags.length > 0 && (
              <div className="flex flex-col gap-4 pt-4">
                <h4 className="text-[14px] font-bold text-black/30">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {request.tags.map((tag: any) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="bg-gray-100 text-gray-500 text-[13px] px-3.5 py-1.5 rounded-full font-medium transition-all"
                    >
                      #{tag.name.toLowerCase()}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* RIGHT COLUMN: PROPOSALS (Flexible width) */}
          <div className="flex-1 w-full space-y-12">
            {/* ACTION SECTION: SUBMISSION FORM (Hidden trigger on desktop, mobile sticky uses ID) */}
            {showSubmissionForm && !isOwner && (
              <div className="w-full">
                <SubmissionForm
                  requestId={request.id}
                  requestBudgetMax={request.budget_max}
                  requestDescription={request.description}
                  hideButton={false}
                />
              </div>
            )}

            {/* BOTTOM SECTION: PROPOSALS FEED */}
            <section className="space-y-6 w-full pt-2">
              <div className="w-full">
                <SubmissionList
                  requestId={request.id}
                  requestTitle={request.title}
                  initialSubmissions={initialSubmissions}
                  winnerId={request.winner_submission_id}
                  canSelectWinner={isOwner}
                  requestStatus={request.status}
                  requestOwnerId={request.user_id}
                  hideTitle={false}
                  largeText={true}
                />
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex sm:hidden items-center gap-3 shadow-lg transition-transform duration-300",
          hideBottomBar ? "translate-y-full" : "translate-y-0"
        )} 
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {showSubmissionForm && !isOwner ? (
          <div className="flex-1">
            <Button 
              className="w-full h-14 rounded-full bg-[#6925DC] text-white font-black text-lg shadow-none"
              onClick={() => {
                if (typeof (window as any).openSubmissionModal === 'function') {
                  (window as any).openSubmissionModal();
                } else {
                  const trigger = document.getElementById('submission-form-trigger');
                  if (trigger) trigger.click();
                }
              }}
            >
              Submit Proposal
            </Button>
          </div>
        ) : (
          <div className="flex-1 text-center font-bold text-gray-500">View Marketplace</div>
        )}
        <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm">
          <FavoriteButton requestId={request.id} isFavorite={isFavorite} />
        </div>
      </div>

      {/* Similar Requests */}
      {similarRequests && similarRequests.length > 0 && (
        <div ref={similarRequestsRef} className="mt-0 py-4 md:mt-12 md:py-16">
          <div className="max-w-[1360px] mx-auto w-full space-y-8 px-3 md:px-12">
            <h2 className="text-3xl font-black text-black leading-none" style={{ fontFamily: 'var(--font-expanded)' }}>You might also like</h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
              {similarRequests.map((similarRequest) => (
                <div key={similarRequest.id} className="break-inside-avoid mb-6">
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

"use client";

import Link from "next/link";
import type { Submission, RequestItem } from "@/lib/types";
import { RequestCard } from "@/components/requests/request-card";
import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/requests/share-button";
import { FavoriteButton } from "@/components/requests/favorite-button";
import { RequestMenu } from "@/components/requests/request-menu";
import { getCategorySlug } from "@/lib/utils/category-routing";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle2, X, Clock, Archive, Check, Sparkles, MapPin, Gauge } from "lucide-react";
import { approveRequestAction, rejectRequestAction, archiveRequestAction } from "@/actions/request.actions";
import { useToast } from "@/components/ui/use-toast";
import * as React from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/reports/report-dialog";
import { formatBudget } from "@/lib/utils/format";
import { formatTimeAgo } from "@/lib/utils/time";
import { toggleFavoriteAction } from "@/actions/favorite.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { IconBook, IconSparkles, IconListCheck } from "@tabler/icons-react";
import SimpleBar from "simplebar-react";

const SubmissionForm = dynamic(() => import("@/components/submissions/submission-form").then(mod => mod.SubmissionForm), {
  ssr: false,
  loading: () => <div className="h-20 w-full animate-pulse bg-gray-50 rounded-2xl border border-dashed border-gray-200" />
});

const SubmissionList = dynamic(() => import("@/components/submissions/submission-list").then(mod => mod.SubmissionList), {
  ssr: false,
  loading: () => <div className="space-y-4 animate-pulse">
    <div className="h-40 w-full bg-gray-50 rounded-2xl border border-gray-100" />
    <div className="h-40 w-full bg-gray-50 rounded-2xl border border-gray-100" />
  </div>
});

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
  const [mounted, setMounted] = React.useState(false);
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = React.useState(false);
  const [showRaw, setShowRaw] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="w-full pb-20" suppressHydrationWarning>
      {/* Centered Content: Request & Proposals */}
      <div className={cn("max-w-[960px] w-full px-3 md:px-12 mx-auto relative")}>

        {/* Header Navigation & Actions moved inside centered container */}
        {mounted && !isModal && (
          <div className="relative h-0">
            <div className="absolute -left-4 lg:-left-16 top-0 md:top-4 z-50">
              <BackButton />
            </div>
          </div>
        )}

        <div className="border border-gray-100 rounded-[20px] overflow-hidden flex flex-col lg:flex-row items-stretch bg-white relative h-[calc(100vh-140px)] max-h-[768px]">
          {/* LEFT COLUMN: REQUEST CARD SIDEBAR (Fixed Width) */}
          <aside className="w-full lg:w-[480px] border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col shrink-0 bg-transparent">
            <SimpleBar className="h-full" autoHide={true}>
              <div className="pb-16">
            {/* EXTERNAL HEADER: Avatar, Date, Icon, Status */}
            <div className="flex flex-col gap-4 mb-4 p-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 border border-gray-100 shadow-sm shrink-0">
                    <AvatarImage src={request.profiles?.avatar_url} />
                    <AvatarFallback className="text-[10px] bg-gray-50 font-bold text-gray-400">
                      {(request.profiles?.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#1A1A1A] text-[12px] leading-none">
                      {request.profiles?.username || "Account"}
                    </span>
                    <span className="text-gray-400 text-[11px] leading-none font-medium">
                      · {mounted ? formatTimeAgo(request.created_at) : "..."}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full font-bold border-none px-3 py-1 text-[11px] bg-transparent shadow-none h-auto",
                      request.status === "solved"
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-[#6925DC] bg-[#6925DC]/10"
                    )}
                  >
                    {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                  </Badge>
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

            <div className="flex-1 flex flex-col p-[50px] min-h-0">
              <div className="flex-1 flex flex-col justify-center">
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
                  showRaw={showRaw}
                  onToggleRaw={() => setShowRaw(!showRaw)}
                />
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="text-[12px] font-medium text-gray-400 hover:text-[#1A1A1A] transition-colors flex items-center gap-2 py-2 px-4 rounded-full bg-transparent border-none shadow-none"
                >
                  {showRaw ? (
                    <>
                      <IconSparkles className="w-3.5 h-3.5 text-[#7755FF]" />
                      <span>Show Criteria</span>
                    </>
                  ) : (
                    <>
                      <IconBook className="w-3.5 h-3.5" />
                      <span>Original Brief</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            </div>
            </SimpleBar>
          </aside>

          {/* RIGHT COLUMN: PROPOSALS (Flexible) */}
          <div className="flex-1 w-full flex flex-col bg-gray-50/30 overflow-hidden">
            <SimpleBar className="flex-1 min-h-0" autoHide={true}>
              <div className="p-4">
                <div className="max-w-[420px] mx-auto space-y-12">
                  {/* BOTTOM SECTION: PROPOSALS FEED */}
                  <section className="w-full">
                    {mounted ? (
                      <SubmissionList
                        requestId={request.id}
                        requestTitle={request.title}
                        initialSubmissions={initialSubmissions}
                        winnerId={request.winner_submission_id}
                        canSelectWinner={isOwner}
                        requestStatus={request.status}
                        requestOwnerId={request.user_id}
                        requestPreferences={preferences}
                        requestDealbreakers={dealbreakers}
                        hideTitle={false}
                        largeText={true}
                      />
                    ) : (
                      <div className="space-y-6 animate-pulse">
                        <div className="h-40 w-full bg-white rounded-3xl border border-gray-100" />
                        <div className="h-40 w-full bg-white rounded-3xl border border-gray-100" />
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </SimpleBar>

            {/* STICKY ACTION SECTION: SUBMISSION FORM */}
            {showSubmissionForm && !isOwner && (
              <div className="p-5 lg:p-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="max-w-[420px] mx-auto">
                  {mounted ? (
                    <SubmissionForm
                      requestId={request.id}
                      requestBudgetMax={request.budget_max}
                      requestDescription={cleanDesc}
                      hideButton={false}
                      requestPreferences={preferences}
                      requestDealbreakers={dealbreakers}
                    />
                  ) : (
                    <div className="h-20 w-full animate-pulse bg-white rounded-3xl border border-gray-100" />
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 flex sm:hidden items-center gap-3 transition-transform duration-300",
          hideBottomBar ? "translate-y-full" : "translate-y-0"
        )}
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {showSubmissionForm && !isOwner ? (
          <div className="flex-1">
            <Button
              className="w-full h-14 rounded-full bg-[#1A1A1A] text-white font-bold text-[16px] shadow-none"
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
          <div className="flex-1 text-center font-bold text-gray-400 text-[15px]">View Marketplace</div>
        )}
        <div className="w-14 h-14 rounded-full flex items-center justify-center border border-gray-100 bg-white">
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

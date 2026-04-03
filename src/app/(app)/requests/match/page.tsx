"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { RequestItem } from "@/lib/types";
import { RequestCard } from "@/components/requests/request-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/layout/auth-provider";

export default function RequestsMatchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["match-requests"],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      
      // Fetch open requests, ordered by most recent
      const { data: requests, error } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching requests:", error);
        return { requests: [], images: {} as Record<string, string[]>, links: {} as Record<string, string[]>, favorites: new Set<string>() };
      }

      if (!requests || requests.length === 0) {
        return { requests: [], images: {} as Record<string, string[]>, links: {} as Record<string, string[]>, favorites: new Set<string>() };
      }

      // Fetch images for all requests
      const requestIds = requests.map((r) => r.id);
      const { data: images } = await supabase
        .from("request_images")
        .select("request_id, image_url, image_order")
        .in("request_id", requestIds)
        .order("image_order", { ascending: true });

      // Fetch links for all requests
      const { data: links } = await supabase
        .from("request_links")
        .select("request_id, url")
        .in("request_id", requestIds);

      // Organize images and links by request_id
      const imagesByRequest: Record<string, string[]> = {};
      const linksByRequest: Record<string, string[]> = {};

      images?.forEach((img) => {
        if (!imagesByRequest[img.request_id]) {
          imagesByRequest[img.request_id] = [];
        }
        imagesByRequest[img.request_id].push(img.image_url);
      });

      links?.forEach((link) => {
        if (!linksByRequest[link.request_id]) {
          linksByRequest[link.request_id] = [];
        }
        linksByRequest[link.request_id].push(link.url);
      });

      // Fetch favorite status if user is logged in
      let favoriteSet = new Set<string>();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        const requestIds = requests.map((r) => r.id);
        const { data: favorites } = await supabase
          .from("favorites")
          .select("request_id")
          .eq("user_id", currentUser.id)
          .in("request_id", requestIds);

        if (favorites) {
          favorites.forEach((fav) => {
            favoriteSet.add(fav.request_id);
          });
        }
      }

      return {
        requests: requests as RequestItem[],
        images: imagesByRequest,
        links: linksByRequest,
        favorites: favoriteSet,
      };
    },
  });

  // Filter out skipped requests
  const availableRequests = requestsData?.requests.filter(
    (req) => !skippedIds.has(req.id)
  ) || [];

  const currentRequest = availableRequests[currentIndex];
  const currentImages = currentRequest
    ? requestsData?.images[currentRequest.id] || []
    : [];
  const currentLinks = currentRequest
    ? requestsData?.links[currentRequest.id] || []
    : [];
  const isCurrentFavorite = currentRequest
    ? requestsData?.favorites?.has(currentRequest.id) || false
    : false;

  const totalCount = availableRequests.length;
  const currentPosition = currentIndex + 1;

  // Handle scroll/swipe to next
  const handleNext = () => {
    if (isScrollingRef.current) return;
    if (currentIndex < availableRequests.length - 1) {
      isScrollingRef.current = true;
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  };

  // Handle previous
  const handlePrevious = () => {
    if (isScrollingRef.current) return;
    if (currentIndex > 0) {
      isScrollingRef.current = true;
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  };


  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, availableRequests.length]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#7755FF]" />
      </div>
    );
  }

  if (!availableRequests || availableRequests.length === 0) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="max-w-md mx-auto px-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            You're done for now
          </h1>
          <p className="text-muted-foreground mb-6">
            There are no more matching requests available at the moment.
          </p>
          <Button onClick={() => router.push("/")} variant="default">
            Browse all requests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border flex-shrink-0">
        <div className="max-w-3xl mx-auto w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {totalCount > 0 && (
              <div className="text-sm text-muted-foreground">
                {currentPosition} of {totalCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
      >
        {currentRequest && (
          <div
            className={cn(
              "transition-all duration-300 ease-out w-full h-full",
              "opacity-100 translate-y-0"
            )}
          >
            {/* Request Card */}
            <RequestCard
              request={currentRequest}
              variant="detail"
              isFavorite={isCurrentFavorite}
              images={currentImages}
              links={currentLinks}
              currentUserId={user?.id || null}
            />
          </div>
        )}
      </div>

      {/* Decision Zone - Full Width */}
      {currentRequest && (
        <div className="sticky bottom-0 left-0 right-0 border-t border-border px-4 sm:px-6 py-4 sm:py-6 z-20">
          <div className="max-w-[720px] mx-auto flex flex-row gap-3 items-center">
            <Button
              onClick={handlePrevious}
              variant="outline"
              size="lg"
              disabled={currentIndex === 0}
              className="flex items-center justify-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                router.push(`/requests/${currentRequest.id}`);
              }}
              variant="default"
              size="lg"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send proposal
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              size="lg"
              disabled={currentIndex >= availableRequests.length - 1}
              className="flex items-center justify-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


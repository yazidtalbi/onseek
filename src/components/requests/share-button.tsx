"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";

export function ShareButton({ requestId }: { requestId: string }) {
  const { toast } = useToast();
  const pathname = usePathname();

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const url = `${window.location.origin}${pathname}`;

    try {
      // Try Web Share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: "Check out this request",
          url: url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The request link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "Link copied!",
            description: "The request link has been copied to your clipboard.",
          });
        } catch (clipboardError) {
          console.error("Error copying to clipboard:", clipboardError);
          toast({
            title: "Failed to copy link",
            description: "Please try again.",
          });
        }
      }
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      className="flex items-center gap-2 px-4 h-11 rounded-full border border-[#383f52] text-[#383f52] hover:bg-[#E8E9ED] transition-colors"
    >
      <Share2 className="h-4 w-4" />
      <span className="text-sm font-medium">Share</span>
    </button>
  );
}


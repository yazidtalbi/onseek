"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, EyeOff, Flag, X, Share2, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/reports/report-dialog";
import { updateRequestStatusAction } from "@/actions/request.actions";
import { hideCategoryAction } from "@/actions/preference.actions";
import { useAuth } from "@/components/layout/auth-provider";
import { useTransition } from "react";
import type { Category } from "@/lib/types";

export function RequestMenu({
  requestId,
  requestUserId,
  status,
  categories,
}: {
  requestId: string;
  requestUserId: string;
  status: "open" | "closed" | "solved";
  categories?: Category[];
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isHidingCategory, setIsHidingCategory] = React.useState(false);
  const [showReportDialog, setShowReportDialog] = React.useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = React.useState(false);
  const [showHideCategoryDialog, setShowHideCategoryDialog] = React.useState(false);
  const [categoryToHide, setCategoryToHide] = React.useState<Category | null>(null);

  const isOwner = user?.id === requestUserId;
  const isOpen = status === "open";

  const handleCloseRequest = () => {
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("status", "closed");
    startTransition(async () => {
      const res = await updateRequestStatusAction(formData);
      if (!res?.error) {
        setShowCloseConfirmDialog(false);
        router.refresh();
      }
    });
  };

  const handleHide = () => {
    if (typeof window === "undefined") return;
    
    try {
      const hidden = JSON.parse(localStorage.getItem("hiddenRequests") || "[]");
      if (!hidden.includes(requestId)) {
        hidden.push(requestId);
        localStorage.setItem("hiddenRequests", JSON.stringify(hidden));
        router.refresh();
      }
    } catch (error) {
      console.error("Error hiding request:", error);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    
    const url = `${window.location.origin}/app/requests/${requestId}`;
    
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
        // You could add a toast notification here
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleHideCategory = (category: Category) => {
    setCategoryToHide(category);
    setShowHideCategoryDialog(true);
  };

  const confirmHideCategory = async () => {
    if (!categoryToHide) return;

    setIsHidingCategory(true);
    try {
      const result = await hideCategoryAction(categoryToHide.id);
      if (!("error" in result)) {
        setShowHideCategoryDialog(false);
        setCategoryToHide(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Error hiding category:", error);
    } finally {
      setIsHidingCategory(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleHide();
            }}
            className="cursor-pointer"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="cursor-pointer"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </DropdownMenuItem>
          {categories && categories.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Not interested
              </div>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHideCategory(category);
                  }}
                  className="cursor-pointer text-sm"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Hide {category.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowReportDialog(true);
            }}
            className="cursor-pointer"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report
          </DropdownMenuItem>
          {isOwner && isOpen && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCloseConfirmDialog(true);
                }}
                disabled={isPending}
                className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
              >
                <X className="h-4 w-4 mr-2" />
                Close request
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportDialog
        type="request"
        targetId={requestId}
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
      />
      
      {/* Close Request Confirmation Dialog */}
      <Dialog open={showCloseConfirmDialog} onOpenChange={setShowCloseConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close request?</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this request? This action cannot be undone. The request will no longer accept new submissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCloseConfirmDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleCloseRequest}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Closing..." : "Close request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hide Category Confirmation Dialog */}
      <Dialog open={showHideCategoryDialog} onOpenChange={setShowHideCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide category?</DialogTitle>
            <DialogDescription>
              We'll show you fewer requests from the "{categoryToHide?.name}" category. You can change this in your settings anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowHideCategoryDialog(false);
                setCategoryToHide(null);
              }}
              disabled={isHidingCategory}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmHideCategory}
              disabled={isHidingCategory}
              className="bg-[#7755FF] hover:bg-[#6644EE] text-white"
            >
              {isHidingCategory ? "Hiding..." : "Hide category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}



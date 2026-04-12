"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, EyeOff, Flag, Share2, Ban, Archive as ArchiveIcon, Pencil, Trash2, Eye } from "lucide-react";
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
import { archiveRequestAction, approveRequestAction, rejectRequestAction, deleteRequestAction } from "@/actions/request.actions";
import { EditRequestModal } from "./edit-request-modal";
import { hideCategoryAction } from "@/actions/preference.actions";
import { useAuth } from "@/components/layout/auth-provider";
import { useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Check, XCircle } from "lucide-react";
import type { Category, RequestStatus, RequestItem } from "@/lib/types";

export function RequestMenu({
  requestId,
  requestUserId,
  status,
  isAdmin,
  categories,
  initialData,
}: {
  requestId: string;
  requestUserId: string;
  status: RequestStatus;
  isAdmin?: boolean;
  categories?: Category[];
  initialData?: RequestItem & { images?: string[]; links?: string[] };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isHidingCategory, setIsHidingCategory] = React.useState(false);
  const [showReportDialog, setShowReportDialog] = React.useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = React.useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showHideCategoryDialog, setShowHideCategoryDialog] = React.useState(false);
  const [categoryToHide, setCategoryToHide] = React.useState<Category | null>(null);

  const isOwner = user?.id === requestUserId;
  const isOpen = status === "open";
  const rid = requestId;
  const rstatus = status;
  const is_admin = isAdmin;

  const handleCloseRequest = () => {
    startTransition(async () => {
      const res = await archiveRequestAction(requestId);
      if (!res?.error) {
        setShowCloseConfirmDialog(false);
        router.refresh();
      }
    });
  };

  const handleDeleteRequest = () => {
    startTransition(async () => {
      const res = await deleteRequestAction(requestId);
      if (!res?.error) {
        setShowDeleteConfirmDialog(false);
        router.push("/app/requests");
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error });
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
        <DropdownMenuContent align="end" className="w-56">
          {is_admin && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Moderation
              </div>
              {rstatus === "pending" && (
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await approveRequestAction(rid);
                    if (res.success) {
                      toast({ title: "Approved", description: "Request is now public" });
                      router.refresh();
                    } else toast({ title: "Error", description: res.error });
                  }}
                  className="cursor-pointer text-green-600"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve & Publish
                </DropdownMenuItem>
              )}
              {(rstatus === "pending" || rstatus === "open") && (
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await rejectRequestAction(rid);
                    if (res.success) {
                      toast({ title: "Rejected", description: "Request has been rejected" });
                      router.refresh();
                    } else toast({ title: "Error", description: res.error });
                  }}
                  className="cursor-pointer text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}
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
          {isOwner && (status === "open" || status === "solved" || status === "pending") && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Manage Request
              </div>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/app/requests/${requestId}`);
                }}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4 mr-2" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="cursor-pointer"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit request
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCloseConfirmDialog(true);
                }}
                disabled={isPending}
                className="cursor-pointer text-gray-600"
              >
                <ArchiveIcon className="h-4 w-4 mr-2" />
                Archive request
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirmDialog(true);
                }}
                disabled={isPending}
                className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete request
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isOwner && initialData && (
        <EditRequestModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          initialData={initialData}
        />
      )}
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
            <DialogTitle>Archive request?</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this request? It will be hidden from your active dashboard.
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
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isPending ? "Archiving..." : "Archive request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Request Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete request?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this request? This action cannot be undone and all data will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteRequest}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete request"}
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



"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Flag, Share2, Bookmark, Pencil, Trash2, Eye, Archive } from "lucide-react";
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
import { useAuth } from "@/components/layout/auth-provider";
import { useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Check, XCircle } from "lucide-react";
import { createRequestUrl } from "@/lib/utils/slug";
import { MobileMenu, MobileMenuItem } from "@/components/ui/mobile-menu";
import type { Category, RequestStatus, RequestItem } from "@/lib/types";

export function RequestMenu({
  requestId,
  requestUserId,
  status,
  isAdmin,
  categories,
  initialData,
  isFavorite,
  onToggleFavorite,
}: {
  requestId: string;
  requestUserId: string;
  status: RequestStatus;
  isAdmin?: boolean;
  categories?: Category[];
  initialData?: RequestItem & { images?: string[]; links?: string[] };
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = React.useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = React.useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isOwner = user?.id === requestUserId;
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
        router.push("/requests");
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error });
      }
    });
  };



  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${createRequestUrl(initialData || { id: requestId })}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Check out this request", url: url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Copied", description: "Link copied to clipboard" });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };



  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:block">
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
                <div className="px-2 py-1.5 text-xs font-semibold text-amber-600">
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
                handleShare();
              }}
              className="cursor-pointer"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              className="cursor-pointer"
            >
              <Bookmark className={cn("h-4 w-4 mr-2", isFavorite ? "fill-current text-[#6925DC]" : "")} />
              {isFavorite ? 'Saved to "My saves"' : 'Save to "My saves"'}
            </DropdownMenuItem>

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
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                  Manage Request
                </div>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(createRequestUrl(initialData || { id: requestId }));
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
                  <Archive className="h-4 w-4 mr-2" />
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
      </div>

      {/* Mobile Menu - Drawer Style */}
      <div className="md:hidden">
        <MobileMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          {is_admin && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-amber-600">
                Moderation
              </div>
              {rstatus === "pending" && (
                <MobileMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await approveRequestAction(rid);
                    if (res.success) {
                      toast({ title: "Approved", description: "Request is now public" });
                      router.refresh();
                    } else toast({ title: "Error", description: res.error });
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-green-600"
                >
                  <Check className="h-5 w-5 mr-3" />
                  Approve & Publish
                </MobileMenuItem>
              )}
              {(rstatus === "pending" || rstatus === "open") && (
                <MobileMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    const res = await rejectRequestAction(rid);
                    if (res.success) {
                      toast({ title: "Rejected", description: "Request has been rejected" });
                      router.refresh();
                    } else toast({ title: "Error", description: res.error });
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-red-600"
                >
                  <XCircle className="h-5 w-5 mr-3" />
                  Reject Request
                </MobileMenuItem>
              )}
              <div className="h-px bg-gray-100 my-2 mx-3" />
            </div>
          )}



          <MobileMenuItem
            onClick={() => {
              handleShare();
              setIsMobileMenuOpen(false);
            }}
          >
            <Share2 className="h-5 w-5 mr-3" />
            Share
          </MobileMenuItem>

          <MobileMenuItem
            onClick={() => {
              onToggleFavorite?.();
              setIsMobileMenuOpen(false);
            }}
          >
            <Bookmark className={cn("h-5 w-5 mr-3", isFavorite ? "fill-current text-[#6925DC]" : "")} />
            {isFavorite ? 'Saved to "My saves"' : 'Save to "My saves"'}
          </MobileMenuItem>



          <div className="h-px bg-gray-100 my-2 mx-3" />
          <MobileMenuItem
            onClick={() => {
              setShowReportDialog(true);
              setIsMobileMenuOpen(false);
            }}
          >
            <Flag className="h-5 w-5 mr-3" />
            Report
          </MobileMenuItem>

          {isOwner && (status === "open" || status === "solved" || status === "pending") && (
            <>
              <div className="h-px bg-gray-100 my-2 mx-3" />
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500">
                Manage Request
              </div>
              <MobileMenuItem
                onClick={() => {
                  router.push(createRequestUrl(initialData || { id: requestId }));
                  setIsMobileMenuOpen(false);
                }}
              >
                <Eye className="h-5 w-5 mr-3" />
                View details
              </MobileMenuItem>
              <MobileMenuItem
                onClick={() => {
                  setShowEditModal(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Pencil className="h-5 w-5 mr-3" />
                Edit request
              </MobileMenuItem>
              <MobileMenuItem
                onClick={() => {
                  setShowCloseConfirmDialog(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Archive className="h-5 w-5 mr-3" />
                Archive request
              </MobileMenuItem>
              <MobileMenuItem
                variant="danger"
                onClick={() => {
                  setShowDeleteConfirmDialog(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Trash2 className="h-5 w-5 mr-3" />
                Delete request
              </MobileMenuItem>
            </>
          )}
        </MobileMenu>
      </div>

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
      
      {/* Confirmation Dialogs - Kept as standard Dialogs */}
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


    </>
  );
}

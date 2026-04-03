"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createRequestUrl } from "@/lib/utils/slug";

interface RequestModalProps {
  children: React.ReactNode;
  requestId: string;
}

export function RequestModal({ children, requestId }: RequestModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.back();
    }
  }, [open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[1100px] w-full h-[100dvh] sm:h-auto sm:w-[95vw] sm:max-h-[90vh] overflow-y-auto p-0 rounded-none sm:rounded-[28px] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white scrollbar-hide flex flex-col">
        {/* Navigation Bar inside Modal */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-10 h-10 p-0 rounded-full bg-gray-100 hover:bg-gray-200 transition-all active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {requestId && (
              <Link
                href={createRequestUrl(requestId)}
                target="_blank"
                scroll={false}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#7755FF] hover:text-[#7755FF]/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Open in new window</span>
              </Link>
            )}

            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-10 h-10 p-0 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all ml-1 active:scale-95"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pb-12 pt-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

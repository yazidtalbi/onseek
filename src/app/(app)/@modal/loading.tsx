import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ModalLoading() {
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-[1100px] w-[95vw] max-h-[90vh] overflow-y-auto p-0 rounded-[28px] border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white scrollbar-hide">
        {/* Navigation Bar Skeleton */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex items-center justify-center">
              <ArrowLeft className="h-5 w-5 text-gray-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex items-center justify-center">
              <X className="h-5 w-5 text-gray-300" />
            </div>
          </div>
        </div>

        <div className="pb-12 pt-6 px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
            {/* Left Column Skeleton */}
            <div className="w-full lg:w-[55%] space-y-6 flex-shrink-0">
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 rounded-2xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
              </div>

              <div className="flex gap-10">
                <Skeleton className="h-12 w-32 rounded-2xl" />
                <Skeleton className="h-12 w-32 rounded-2xl" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
              </div>

              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-2xl" />
                ))}
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="flex-1 space-y-6 min-w-0 w-full">
              <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 space-y-4">
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>

              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-50/50 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24 rounded-md" />
                        <Skeleton className="h-4 w-32 rounded-md" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

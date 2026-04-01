import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/ui/back-button";

export default function RequestDetailLoading() {
  return (
    <div className="mx-auto w-full space-y-6 px-4 md:px-6 animate-in fade-in duration-500">
      {/* Back Button and Breadcrumbs Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
        <Skeleton className="h-4 w-32 rounded-md" />
      </div>

      {/* Two Column Layout Skeleton */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
        {/* Left Column Skeleton */}
        <div className="w-full lg:w-[55%] space-y-6 flex-shrink-0">
          <div className="bg-white rounded-2xl p-0 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-full" />
              </div>
            </div>
            
            <div className="flex gap-10">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>

            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-12 rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex-1 space-y-6 min-w-0">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e5e7eb] p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

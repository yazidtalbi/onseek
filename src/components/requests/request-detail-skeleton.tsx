import { Skeleton } from "@/components/ui/skeleton";

export function RequestDetailSkeleton() {
  return (
    <div className="mx-auto w-full space-y-8 px-4 md:px-6 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
        {/* Left Column: Request Details Skeleton */}
        <div className="w-full lg:w-[55%] space-y-8 flex-shrink-0">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="grid grid-cols-3 gap-10 pt-8">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-12 rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Submissions Skeleton */}
        <div className="flex-1 space-y-6 min-w-0">
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full rounded-2xl" />
          </div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

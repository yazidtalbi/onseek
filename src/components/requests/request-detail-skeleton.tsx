import { Skeleton } from "@/components/ui/skeleton";

export function RequestDetailSkeleton() {
  return (
    <div className="mx-auto w-full space-y-8 px-4 md:px-12 animate-pulse pt-2">
      {/* Header Navigation Silhouette */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex gap-4">
          <Skeleton className="h-6 w-12 rounded-full bg-gray-100/80" />
          <Skeleton className="h-6 w-48 rounded-full bg-gray-100/80" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start relative pb-20">
        {/* Left Column: Abstract Request Card Silhouette (Large Rounded Block) */}
        <aside className="w-full lg:w-[480px] shrink-0">
          <Skeleton className="w-full h-[640px] rounded-[32px] bg-gray-100/60" />
        </aside>

        {/* Right Column: Abstract Proposals Silhouette */}
        <div className="flex-1 w-full space-y-12">
          {/* Submission Bar Silhouette */}
          <Skeleton className="h-[64px] w-full rounded-full bg-gray-100/60" />

          {/* Proposals List Silhouettes */}
          <div className="space-y-6 pt-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[200px] w-full rounded-[24px] bg-gray-100/40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

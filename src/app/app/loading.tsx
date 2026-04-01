import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AppLoading() {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      {/* Category Pills Skeleton */}
      <div className="w-full flex flex-col gap-3 py-2 mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 overflow-hidden px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
              <Skeleton className="h-7 w-7 rounded-full bg-white" />
              <Skeleton className="h-7 w-7 rounded-full bg-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-6 py-4 w-full">
        {/* Mock Create Request Card */}
        <div className="break-inside-avoid mb-6">
          <div className="w-full rounded-2xl bg-white border border-[#e6e7eb] min-h-[140px] flex flex-col p-4">
            <div className="flex items-center gap-3 flex-1 mb-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-48 rounded-md" />
            </div>
            <div className="flex justify-end mt-auto">
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </div>

        {/* Mock Request Cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="break-inside-avoid mb-6 bg-[#f5f6f9] rounded-[20px] p-[6px]">
            <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className={cn("h-6 w-3/4 rounded-md", i % 2 === 0 ? "w-1/2" : "w-3/4")} />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                <Skeleton className="h-4 w-32 rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

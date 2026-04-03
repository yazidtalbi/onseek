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
      <div className="columns-[360px] gap-6 pb-4 w-full">
        {/* Mock Create Request Card - Simplified */}
        <div className="break-inside-avoid mb-6 bg-gray-100/60 animate-pulse rounded-[28px] h-[160px]" />

        {/* Mock Request Cards - Simplified Pinterest Style */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div 
            key={i} 
            className="break-inside-avoid mb-6 bg-gray-100/60 animate-pulse rounded-[28px]" 
            style={{ 
              height: i % 3 === 0 ? '380px' : i % 2 === 0 ? '280px' : '320px' 
            }} 
          />
        ))}
      </div>
    </div>
  );
}

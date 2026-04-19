import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AppLoading() {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500 pt-4">
      {/* Abstract Header Silhouette */}
      <div className="w-full flex items-center justify-between mb-12">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-full bg-gray-100/80" />
          <Skeleton className="h-10 w-24 rounded-full bg-gray-100/80" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full bg-gray-100/80" />
      </div>

      {/* Grid Skeleton - Minimal Rounded Blocks */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 pb-4 w-full">
        {/* Variety of rounded blocks with different aspect ratios */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div 
            key={i} 
            className="break-inside-avoid mb-6 bg-gray-100/60 animate-pulse rounded-[32px]" 
            style={{ 
              height: i % 4 === 0 ? '420px' : i % 3 === 0 ? '300px' : i % 2 === 0 ? '360px' : '260px' 
            }} 
          />
        ))}
      </div>
    </div>
  );
}

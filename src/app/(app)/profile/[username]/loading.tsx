import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-[#e5e7eb]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <Skeleton className="h-3 w-1/3 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#e5e7eb]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-12 rounded-md" />
                    <Skeleton className="h-6 w-8 rounded-md" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4 border-b border-[#e5e7eb] pb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-md" />
            ))}
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-[#e5e7eb]">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/2 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

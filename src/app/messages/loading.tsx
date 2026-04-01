import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
        <Skeleton className="h-4 w-24 rounded-md" />
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="hidden sm:block w-[320px] md:w-[380px] shrink-0 h-full border-r border-gray-100">
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window Skeleton */}
        <div className="flex-1 h-full flex flex-col">
          <div className="h-16 border-b flex items-center px-4 gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-md" />
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className={`h-10 w-64 rounded-2xl ${i % 2 === 0 ? "bg-indigo-50" : "bg-gray-100"}`} />
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

export function ActivityRibbon({ capitalizedItem }: { capitalizedItem: string }) {
  return (
    <div className="border-y border-gray-200 bg-white overflow-hidden py-4">
      <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-12">
            <div className="flex items-center gap-2 text-[13px] text-[#1A1A1A] font-medium tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              New Request for {capitalizedItem} in Casablanca
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#1A1A1A] font-medium tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              3 Proposals sent for {capitalizedItem}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#1A1A1A] font-medium tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              Matched 12 minutes ago
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RequestCard } from "./request-card";

interface RequestSliderProps {
  requests: any[];
  items?: any[]; // for fallback
}

export function RequestSlider({ requests, items }: RequestSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/feed">
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
      >
        {requests && requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.id} className="min-w-[300px] md:min-w-[380px] snap-center">
              <div className="border border-gray-100 rounded-[24px] overflow-hidden bg-white h-full">
                <RequestCard request={req} variant="feed" />
              </div>
            </div>
          ))
        ) : (
          (items || [1, 2, 3, 4, 5]).map((i) => (
            <div key={i} className="min-w-[300px] md:min-w-[380px] snap-center">
              <div className="bg-white border border-gray-100 p-8 rounded-[24px] h-[300px] flex flex-col justify-between shadow-none">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-[#7755FF] bg-[#F5F3FF] px-2 py-0.5 rounded-full">ACTIVE</span>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Just posted</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight mb-2 text-[#1A1A1A]">iPhone 15 Pro Max - Natural Titanium</p>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-3">Looking for a brand new, sealed iPhone 15 Pro Max. Prefer 256GB model. Must have local warranty.</p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <span className="text-lg font-bold text-[#1A1A1A]">$1,200</span>
                  <div className="text-[#7755FF] font-bold text-xs uppercase tracking-tight">View Request</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation Chevrons */}
      <button 
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-none hover:text-[#7755FF] transition-colors opacity-0 group-hover/feed:opacity-100 hidden md:flex z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 shadow-none hover:text-[#7755FF] transition-colors opacity-0 group-hover/feed:opacity-100 hidden md:flex z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}

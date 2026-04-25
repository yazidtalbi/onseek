"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LEFT_IMAGES = [
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300", isFace: true },
  { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&h=300", isFace: false },
  { url: "/community_avatar.jpg", isFace: true },
  { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&h=300", isFace: false },
];

const RIGHT_IMAGES = [
  { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=360", isFace: false },
  { url: "/community_avatar_2.jpg", isFace: true },
  { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&h=300", isFace: false },
  { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&h=300", isFace: true },
];

function VerticalImageList({ items, className, reverseAnimation = false }: { items: { url: string, isFace: boolean }[], className?: string, reverseAnimation?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((item, i) => (
        <motion.div 
          key={i} 
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4 + (i * 0.5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4 * (reverseAnimation ? -1 : 1)
          }}
          className={cn(
            "w-[70px] h-[70px] md:w-[100px] md:h-[100px] overflow-hidden shrink-0",
            item.isFace ? "rounded-full" : "rounded-[24px]"
          )}
        >
          <img src={item.url} alt="Community Item" className="w-full h-full object-cover" />
        </motion.div>
      ))}
    </div>
  );
}

export function InterceptBanner() {
  const router = useRouter();

  const handlePostRequest = () => {
    window.dispatchEvent(new CustomEvent('open-ai-request-flow'));
  };

  const handleStartSelling = () => {
    router.push("/listings");
  };

  return (
    <div className="w-full py-10 px-3 md:px-6">
      <div className="max-w-[960px] mx-auto w-full">
        <div className="relative overflow-hidden rounded-[24px] bg-[#f6f6f6] min-h-[340px] flex items-center justify-center border-none">
          
          {/* Left Vertical List */}
          <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 hidden lg:block">
            <VerticalImageList items={LEFT_IMAGES} />
          </div>

          {/* Right Vertical List */}
          <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 hidden lg:block">
            <VerticalImageList items={RIGHT_IMAGES} reverseAnimation />
          </div>

          {/* Center Content Area */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 py-10 mx-auto max-w-[480px]">
             {/* Rating/Trust Badge */}
             <div className="flex items-center gap-1.5 mb-6">
                <span className="text-[#FF8A00] text-base">★</span>
                <span className="text-[13px] font-bold text-gray-600 tracking-tight">Joined by 1,000+ seekers & solvers worldwide</span>
             </div>

            <h2 className="text-[32px] md:text-[44px] font-black text-[#1A1A1A] leading-[1.1] tracking-tight mb-4" style={{ fontFamily: 'var(--font-expanded)', letterSpacing: '-0.04em' }}>
              Get it, your way<span className="text-[#7b3ff2]">.</span>
            </h2>
            
            <p className="text-sm md:text-base text-gray-500 font-medium leading-[1.4] mb-8 max-w-[340px]">
              Join us and let the community find<br />exactly what you&apos;re looking for.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <Button
                onClick={handlePostRequest}
                className="w-full sm:w-[160px] h-[52px] rounded-full bg-[#7b3ff2] text-white hover:bg-[#6a34d1] font-bold text-[16px] transition-all active:scale-95 shadow-none"
              >
                I want
              </Button>
              
              <Button
                variant="outline"
                onClick={handleStartSelling}
                className="w-full sm:w-[160px] h-[52px] rounded-full border bg-transparent text-[#7b3ff2] hover:bg-[#7b3ff2]/5 font-bold text-[16px] transition-all active:scale-95 shadow-none"
                style={{ borderColor: '#7b3ff2' }}
              >
                I have
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

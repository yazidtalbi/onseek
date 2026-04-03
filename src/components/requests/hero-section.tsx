"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/auth-modal";
import type { User } from "@supabase/supabase-js";

interface HeroSectionProps {
  user: User | null;
  tradeMode: "buy" | "sell";
  setTradeMode: (mode: "buy" | "sell") => void;
}

export function HeroSection({ user, tradeMode, setTradeMode }: HeroSectionProps) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1360px] flex items-center justify-center rounded-[32px] bg-white overflow-hidden px-6 py-12 sm:px-10 sm:py-16 min-h-[440px] mb-4 transition-all duration-500">
        {/* Hero background images */}
        <div className="hidden lg:block absolute -left-6 xl:-left-10 top-[40%] -translate-y-1/2 w-[260px] xl:w-[320px] h-[260px] xl:h-[320px] pointer-events-none z-0">
          <Image src="/hero/left.png" alt="Microphone composition" fill className="object-contain mix-blend-multiply" priority />
        </div>
        <div className="hidden lg:block absolute -right-6 xl:-right-10 top-[40%] -translate-y-1/2 w-[260px] xl:w-[320px] h-[260px] xl:h-[320px] pointer-events-none z-0">
          <Image src="/hero/right.png" alt="Gadgets composition" fill className="object-contain mix-blend-multiply" priority />
        </div>

        <div className="mx-auto w-full text-center flex flex-col items-center relative z-10 max-w-3xl">
          <div className="relative flex items-center p-1.5 bg-[#f4f5f8] rounded-2xl mb-6 w-fit mx-auto">
            <div
              className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl transition-all duration-300 ease-out"
              style={{
                left: tradeMode === "buy" ? '6px' : 'calc(50%)'
              }}
            />
            <button
              type="button"
              onClick={() => setTradeMode("buy")}
              className={cn(
                "relative z-10 px-8 py-2.5 min-w-[120px] text-[13px] font-bold tracking-widest transition-colors duration-300 outline-none",
                tradeMode === "buy" ? "text-[#1e2330]" : "text-[#8e95a5] hover:text-[#6a7282]"
              )}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setTradeMode("sell")}
              className={cn(
                "relative z-10 px-8 py-2.5 min-w-[120px] text-[13px] font-bold tracking-widest transition-colors duration-300 outline-none",
                tradeMode === "sell" ? "text-[#1e2330]" : "text-[#8e95a5] hover:text-[#6a7282]"
              )}
            >
              SELL
            </button>
          </div>

          <h1
            className="mx-auto text-3xl leading-[1.25] tracking-tight text-foreground sm:text-5xl font-medium"
            style={{ fontFamily: 'var(--font-expanded)' }}
          >
            Stop searching<br />& start <span className="text-[#7860fe] bg-[#f0edff] px-3 py-1 rounded-l-lg pb-1.5 align-baseline border-solid border-r-[3px]" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 500, borderRightColor: "#7860fe" }}>seeking</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-500 sm:text-lg px-4 sm:px-0">
            Post a request, receive offers, compare deals, and connect with the right seller.
          </p>

          <div className={cn(
            "mx-auto w-full max-w-xl relative transition-all duration-500",
            tradeMode === "buy" ? "mt-8" : "mt-2"
          )}>
            {/* Panels Container */}
            <div className="relative w-full h-[130px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/60 via-indigo-50/60 to-purple-100/60 blur-3xl rounded-full scale-[1.1] -z-10 pointer-events-none" />

              {/* BUY Panel */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                  }
                }}
                className={cn(
                  "absolute inset-0 w-full rounded-2xl bg-white border border-[#e6e7eb] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 ease-out h-[130px] flex flex-col p-5 group cursor-pointer hover:border-[#7755FF]/30",
                  tradeMode === 'buy' ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                )}
              >
                <span className="text-[#a5abb7] text-[16px] font-medium text-left flex-1 pl-1 pt-1 font-sans">
                  I'm looking for a smartphone with 8gb..
                </span>
                <div className="absolute bottom-4 right-4">
                  <div className="rounded-full bg-gray-100 text-gray-400 px-6 py-2.5 text-[15px] font-medium flex items-center justify-center transition-colors cursor-not-allowed">
                    Request
                  </div>
                </div>
              </div>

              {/* SELL Panel */}
              <div
                className={cn(
                  "absolute inset-0 w-full h-[130px] flex items-center justify-center transition-all duration-500 ease-out",
                  tradeMode === 'sell' ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}
              >
                <Button
                  onClick={() => {
                    if (user) {
                      router.push('/personal-items');
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="rounded-full bg-[#1e2330] hover:bg-[#2a303f] text-white px-10 py-6 text-[16px] font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Sell your item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isAuthModalOpen && (
        <AuthModal
          open={isAuthModalOpen}
          onOpenChange={setIsAuthModalOpen}
          title="Sell your items to the world"
          description="Sign in or create an account to start selling and track your inventory on Onseek."
        />
      )}
    </>
  );
}

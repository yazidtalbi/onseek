"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/auth-modal";
import type { User } from "@supabase/supabase-js";
import { ArrowRight } from "lucide-react";

interface HeroSectionV2Props {
  user: User | null;
  tradeMode: "buy" | "sell";
  setTradeMode: (mode: "buy" | "sell") => void;
}

export function HeroSectionV2({ user, tradeMode, setTradeMode }: HeroSectionV2Props) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1360px] min-h-[520px] rounded-[40px] bg-[#6925DC] overflow-hidden mt-2 mb-6 lg:mb-8 flex items-center">
        {/* Background Assets */}
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none z-0">
          <Image
            src="/hero/hero-v2-bg-left-new.png"
            alt="Background ornament"
            fill
            className="object-contain object-bottom-left opacity-100"
          />
        </div>

        {/* Background Asset (Person + Swirl) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/hero/hero-v2-main-new.png"
            alt="Hero illustration"
            fill
            className="object-contain object-right"
            priority
            quality={100}
          />
        </div>

        <div className="relative z-10 w-full px-8 sm:px-16 pt-12 pb-16 flex flex-col items-start max-w-3xl">
          {/* Buy/Sell Toggle */}
          <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-full mb-10 border border-white/20">
            <button
              onClick={() => setTradeMode("buy")}
              className={cn(
                "px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                tradeMode === "buy" ? "bg-white text-[#6925DC] shadow-sm" : "text-white hover:text-white/80"
              )}
            >
              • Buy
            </button>
            <button
              onClick={() => setTradeMode("sell")}
              className={cn(
                "px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                tradeMode === "sell" ? "bg-white text-[#6925DC] shadow-sm" : "text-white hover:text-white/80"
              )}
            >
              Sell
            </button>
          </div>

          {/* Main Title */}
          <h1
            className="text-white text-[44px] sm:text-[68px] leading-[1.15] tracking-tight mb-8 font-black"
            style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}
          >
            Stop searching,<br />
            <span className="inline-flex items-center whitespace-nowrap">Start <span className="inline-flex items-center justify-center px-8 py-0 sm:py-1 lg:py-2 bg-white text-[#6925DC] rounded-full ml-3 sm:ml-4 -mt-1 sm:-mt-2">seeking</span></span>
          </h1>

          {/* Description */}
          <div className="flex items-start gap-4 mb-12 max-w-md">
            <div className="mt-1 shrink-0">
              <Image src="/hero/hour.png" alt="Hourglass" width={28} height={28} className="object-contain" />
            </div>
            <p className="text-white text-lg font-semibold  leading-relaxed">
              Post a request, receive proposals, compare deals & connect with the right seller.
            </p>
          </div>

          {/* Search/Input Bar */}
          {tradeMode === "buy" ? (
            <div
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-create-request-modal'));
              }}
              role="button"
              tabIndex={0}
              className="w-full max-w-lg relative group cursor-pointer"
            >
              <div className="relative flex items-center w-full h-[72px] bg-black/10 backdrop-blur-xl border border-white/20 rounded-full px-6 transition-all duration-300 group-focus-within:bg-white/15 hover:bg-white/15">
                <input
                  type="text"
                  placeholder="Start typing your request.."
                  value={searchValue}
                  readOnly
                  className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-white/50 text-lg font-medium pr-12 cursor-pointer pointer-events-none"
                />
                <button
                  type="button"
                  className="absolute right-2 w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#6925DC] hover:scale-105 active:scale-95 transition-all shadow-lg pointer-events-none"
                >
                  <ArrowRight className="h-6 w-6 stroke-[2.5px]" />
                </button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (user) {
                  router.push('/personal-items');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              size="lg"
              className="h-16 px-12 rounded-full bg-white text-[#6925DC] hover:bg-white/90 text-[17px] font-bold shadow-xl transition-all hover:scale-[1.02]"
            >
              Sell your item
            </Button>
          )}
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

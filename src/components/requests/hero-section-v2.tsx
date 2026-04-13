"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/auth-modal";
import type { User } from "@supabase/supabase-js";
import { Sparkles, Loader2 } from "lucide-react";
import { AIRequestFlow } from "./ai-request-flow";

interface HeroSectionV2Props {
  user: User | null;
  tradeMode: "buy" | "sell";
  setTradeMode: (mode: "buy" | "sell") => void;
}

export function HeroSectionV2({ user, tradeMode, setTradeMode }: HeroSectionV2Props) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAIFlowOpen, setIsAIFlowOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Auto-resume AI flow if draft exists
  useEffect(() => {
    const saved = sessionStorage.getItem("onseek_ai_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.initialText) {
          setSearchValue(parsed.initialText);
          setIsAIFlowOpen(true);
        }
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [searchValue]);

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1360px] min-h-[540px] lg:h-[600px] rounded-[24px] bg-[#6925DC] overflow-hidden mt-2 mb-6 lg:mb-8 flex flex-col lg:flex-row items-stretch">

        {/* Mobile Highlight Image (Visible only on small screens) */}
        <div className="lg:hidden w-full h-[300px] relative">
          <Image
            src="/hero/hero-illustration.jpg"
            alt="Hero illustration"
            fill
            className="object-cover"
          />
        </div>

        {/* Content Side */}
        <div className="flex-[1.2] flex flex-col justify-center items-start px-8 sm:px-16 py-12 lg:py-16 relative z-10">
          {/* Main Title */}
          <h1
            className="text-white text-[38px] sm:text-[56px] leading-[1.15] tracking-tight mb-8 font-black"
            style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}
          >
            Stop searching,<br />
            <span className="inline-flex items-center whitespace-nowrap">Start <span className="inline-flex items-center justify-center px-8 py-0 sm:py-1 lg:py-2 bg-white text-[#6925DC] rounded-full ml-3 sm:ml-4 -mt-1 sm:-mt-2">seeking</span></span>
          </h1>

          {/* Description */}
          <div className="flex items-center gap-4 mb-8 max-w-md">
            <div className="shrink-0">
              <Image src="/hero/hour.png" alt="Hourglass" width={28} height={28} className="object-contain" />
            </div>
            <p className="text-white text-lg font-semibold  leading-relaxed">
              Post a request, receive proposals, compare deals & connect with the right seller.
            </p>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-full mb-10 border border-white/20">
            <button
              onClick={() => setTradeMode("buy")}
              className={cn(
                "px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                tradeMode === "buy" ? "bg-white text-[#6925DC] shadow-sm" : "text-white hover:text-white/80"
              )}
            >
              I want to buy
            </button>
            <button
              onClick={() => setTradeMode("sell")}
              className={cn(
                "px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-300",
                tradeMode === "sell" ? "bg-white text-[#6925DC] shadow-sm" : "text-white hover:text-white/80"
              )}
            >
              I want to sell
            </button>
          </div>

          {/* Search/Input Bar */}
          {tradeMode === "buy" ? (
            <div className="w-full max-w-xl relative group">
              <div className="relative flex flex-col w-full min-h-[100px] h-auto bg-white rounded-[24px] px-8 pt-6 pb-14 transition-all duration-300 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.2)]">
                <textarea
                  ref={textareaRef}
                  placeholder="Describe what you are looking for..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  rows={2}
                  className="bg-transparent border-none outline-none w-full text-[#1A1A1A] placeholder:text-gray-500 placeholder:text-[14px] text-[17px] font-medium resize-none overflow-hidden"
                />

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    if (searchValue.trim()) {
                      setIsAIFlowOpen(true);
                    } else {
                      window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                    }
                  }}
                  className="absolute bottom-4 right-4 gap-2.5 shadow-none"
                >
                  <span>Next</span>
                  <Sparkles className="h-4 w-4 text-white fill-white" />
                </Button>
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

        {/* Image Side (Desktop Only) with Padding & Rounding */}
        <div className="hidden lg:block flex-1 py-4 pr-4 relative">
          <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-2xl">
            <Image
              src="/hero/hero-illustration.jpg"
              alt="Hero illustration"
              fill
              className="object-cover"
              priority
            />
            {/* Clean image display without overlays */}

          </div>

          {/* Poppy Pink Cloud Overlay (outside overflow-hidden for 'layering' effect) */}
          <div className="absolute -top-2 -left-4 w-72 h-44 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-1000 z-20">
            <Image
              src="/hero/cloud-v2.png"
              alt="Cloud decoration"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {isAIFlowOpen && (
        <AIRequestFlow
          initialText={searchValue}
          onClose={() => setIsAIFlowOpen(false)}
          user={user}
        />
      )}

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

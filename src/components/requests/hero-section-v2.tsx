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
import { motion, AnimatePresence } from "framer-motion";

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

  // Initialize fresh on mount
  useEffect(() => {
    setSearchValue("");
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
      <section id="onseek-hero" className="w-full h-auto py-2 px-4 md:px-6 mt-20 lg:mt-24">
        <div className="mx-auto w-full max-w-[1280px] min-h-[600px] lg:h-[75vh] bg-[#6925DC] rounded-[32px] overflow-hidden relative flex items-center shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)]">
          <div className="w-full h-full flex flex-col lg:flex-row items-stretch relative z-10">
            {/* Content Side */}
            <div className="flex-1 lg:flex-[0.6] flex flex-col justify-center items-start py-12 lg:py-20 pl-10 lg:pl-16 pr-4 lg:pr-6 mr-auto">
              <AnimatePresence initial={false}>
                {!searchValue && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full overflow-hidden"
                  >
                    {/* Main Title */}
                    <h1
                      className="text-white text-[32px] sm:text-[48px] lg:text-[54px] leading-[1.1] tracking-tight mb-10 font-black max-w-3xl"
                      style={{ fontFamily: 'var(--font-title)', fontWeight: 600 }}
                    >
                      Stop searching,<br />
                      start seeking.
                    </h1>

                    {/* Description */}
                    <div className="flex items-center gap-4 mb-10 max-w-xl">
                      <div className="shrink-0">
                        <Image src="/hero/hour.png" alt="Hourglass" width={28} height={28} className="object-contain" />
                      </div>
                      <p className="text-white text-xl font-semibold leading-relaxed">
                        Post a request, receive proposals, compare deals & connect with the right seller.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buy/Sell Toggle */}
              <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
                <button
                  onClick={() => setTradeMode("buy")}
                  className={cn(
                    "px-8 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    tradeMode === "buy" ? "bg-white text-[#6925DC] shadow-lg" : "text-white hover:text-white/80"
                  )}
                >
                  I want to buy
                </button>
                <button
                  onClick={() => setTradeMode("sell")}
                  className={cn(
                    "px-8 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    tradeMode === "sell" ? "bg-white text-[#6925DC] shadow-lg" : "text-white hover:text-white/80"
                  )}
                >
                  I want to sell
                </button>
              </div>

              {/* Search/Input Bar */}
              {tradeMode === "buy" ? (
                <div className="w-full max-w-3xl relative">
                  <div className="relative flex flex-col w-full min-h-[120px] h-auto bg-white rounded-[28px] px-8 pt-7 pb-14 transition-all duration-300 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] hover:shadow-[0_40px_80px_-16px_rgba(0,0,0,0.2)]">
                    <textarea
                      ref={textareaRef}
                      placeholder="Describe what you are looking for..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      rows={2}
                      className="bg-transparent border-none outline-none w-full text-[#1A1A1A] placeholder:text-gray-400 placeholder:text-[18px] text-[18px] font-medium resize-none overflow-hidden leading-relaxed"
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
                      className="absolute bottom-5 right-5 h-11 px-6 gap-2 bg-[#1A1A1A] hover:bg-black text-white rounded-full font-bold shadow-none"
                    >
                      <span>Next</span>
                      <Sparkles className="h-4 w-4" />
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
                  className="h-16 px-12 rounded-full bg-white text-[#6925DC] hover:bg-white/90 text-[18px] font-bold shadow-xl transition-all hover:scale-[1.02]"
                >
                  Sell your item
                </Button>
              )}
            </div>

            {/* Image Side (Desktop Only) */}
            <div className="hidden lg:flex flex-[0.5] relative items-center justify-end p-8 lg:p-10">
              <div className="relative h-full aspect-square rounded-[28px] overflow-hidden shadow-2xl">
                <Image
                  src="/hero/hero-illustration.jpg"
                  alt="Hero illustration"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
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

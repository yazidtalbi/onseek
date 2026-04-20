"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/auth-modal";
import type { User } from "@supabase/supabase-js";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { AIRequestFlow } from "./ai-request-flow";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSectionV2Props {
  user: User | null;
  profile: any;
  tradeMode: "buy" | "sell";
  setTradeMode: (mode: "buy" | "sell") => void;
}

export function HeroSectionV2({ user, profile, tradeMode, setTradeMode }: HeroSectionV2Props) {
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
      <section id="onseek-hero" className="w-full h-auto px-4 md:px-6 mt-5 overflow-visible">
        <div className="mx-auto w-full max-w-[1280px] min-h-[600px] lg:h-[642px] relative group">
          {/* Unified Container */}
          <div className="w-full h-full bg-[#6925DC] relative flex flex-col justify-center items-start py-12 lg:py-20 px-10 lg:px-16 rounded-[24px] overflow-hidden">
            {/* Hero Image - Rounded with spacing */}
            <div className="hidden lg:block absolute right-6 top-6 bottom-6 w-[42%] pointer-events-none z-0 rounded-[20px] overflow-hidden">
              <Image
                src="/hero/finalhero.png"
                alt="Hero illustration"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Cloud Overlay - Floating on top of the image edge */}
            <div 
              className="hidden lg:block absolute z-20 pointer-events-none w-48 h-48"
              style={{ top: '28px', right: '420px', transform: 'scale(1.3)' }}
            >
              <Image
                src="/hero/finalnuage.png"
                alt=""
                fill
                className="object-contain"
              />
            </div>

            {/* DIMMEN SVG (Bottom Left Ornament) */}
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-30 z-0">
              <Image
                src="/hero/hero-v2-bg-left-new.png"
                alt=""
                fill
                className="object-contain object-bottom-left"
              />
            </div>

            <div className="relative z-10 w-full lg:max-w-[58%]">
              <AnimatePresence initial={false}>
                {!searchValue && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full"
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
                    <div className="flex items-start gap-4 mb-12 max-w-xl">
                      <div className="shrink-0 mt-1">
                        <Image src="/hero/hour.png" alt="Hourglass" width={24} height={24} className="object-contain opacity-90" />
                      </div>
                      <p className="text-white/85 text-[21px] font-medium leading-[1.4] tracking-tight">
                        Flip the script on shopping. Define your vision, set your terms, and let the community find the perfect item for you.
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
                    tradeMode === "buy" ? "bg-white text-[#6925DC]" : "text-white hover:text-white/80"
                  )}
                >
                  I want to buy
                </button>
                <button
                  onClick={() => setTradeMode("sell")}
                  className={cn(
                    "px-8 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    tradeMode === "sell" ? "bg-white text-[#6925DC]" : "text-white hover:text-white/80"
                  )}
                >
                  I want to sell
                </button>
              </div>

              {/* Search/Input Bar */}
              {tradeMode === "buy" ? (
                <div className="w-full max-w-xl relative">
                  <div className="relative flex flex-col w-full min-h-[100px] h-auto bg-white rounded-[24px] px-8 pt-7 pb-14 transition-all duration-300 border border-transparent focus-within:border-white/20">
                    <textarea
                      ref={textareaRef}
                      placeholder="Describe what you are looking for..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (searchValue.trim()) {
                            setIsAIFlowOpen(true);
                          } else {
                            window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                          }
                        }
                      }}
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
                      <span>Post</span>
                      <ArrowRight className="h-4 w-4 text-[#FF8C5A]" strokeWidth={3} />
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
                  className="h-16 px-12 rounded-full bg-white text-[#6925DC] hover:bg-white/90 text-[18px] font-bold shadow-none transition-all hover:scale-[1.02]"
                >
                  Sell your item
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {isAIFlowOpen && (
        <AIRequestFlow
          initialText={searchValue}
          onClose={() => setIsAIFlowOpen(false)}
          user={user}
          profile={profile}
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

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/auth-modal";
import type { User } from "@supabase/supabase-js";
import { Sparkles, Loader2, ArrowRight, Zap, User as UserIcon } from "lucide-react";
import { AIRequestFlow } from "./ai-request-flow";
import { motion, AnimatePresence } from "framer-motion";
import { IconCrown } from "@tabler/icons-react";
import { getRequestsCountAction } from "@/actions/request.actions";

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
  const [stats, setStats] = useState({ usersActive: 122, seekersToday: 1024, requestsDaily: 768 });
  const jitterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update stats on mount and every minute
  useEffect(() => {
    const calculateStats = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const decimalHour = h + m / 60;
      
      const intensity = (Math.cos((decimalHour - 18) * Math.PI / 12) + 1) / 2;
      const baseUsers = 48 + Math.floor(intensity * 112);
      
      const today = now.toISOString().split('T')[0];
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Daily requests for hero: 600 to 900
      const dailyRequests = 600 + (seed % 300);
      // Daily seekers: 1000 to 2000
      const dailySeekers = 1000 + (seed % 1000);

      return {
        usersActive: baseUsers + (Math.floor(Math.random() * 8) - 4),
        seekersToday: dailySeekers,
        requestsDaily: dailyRequests
      };
    };

    setStats(calculateStats());

    const scheduleJitter = () => {
      const delay = Math.floor(Math.random() * (20000 - 2000 + 1)) + 2000;
      jitterTimeoutRef.current = setTimeout(() => {
        setStats(prev => ({
          ...prev,
          usersActive: Math.max(40, prev.usersActive + (Math.random() > 0.5 ? 1 : -1))
        }));
        jitterTimeoutRef.current = scheduleJitter();
      }, delay);
      return jitterTimeoutRef.current;
    };

    jitterTimeoutRef.current = scheduleJitter();

    const baseInterval = setInterval(() => {
      const newStats = calculateStats();
      setStats(prev => ({
        ...newStats,
        usersActive: newStats.usersActive
      }));
    }, 60000);

    return () => {
      if (jitterTimeoutRef.current) clearTimeout(jitterTimeoutRef.current);
      clearInterval(baseInterval);
    };
  }, []);

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
      <section id="onseek-hero" className="w-full h-auto px-0 md:px-0 mt-0 lg:mt-0 overflow-visible text-left">
        <div className="mx-auto w-full min-h-[500px] relative group">
          {/* Unified Container */}
          <div className="w-full h-full relative flex flex-col justify-center items-center text-center pt-8 pb-12 lg:pt-12 lg:pb-16 px-6 lg:px-16 overflow-hidden bg-transparent">
            <div className="relative z-10 w-full lg:max-w-[95%] mx-auto flex flex-col items-center">
              <AnimatePresence initial={false}>
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full"
                >

                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-bold uppercase tracking-widest mb-6">
                    <IconCrown className="w-4 h-4 text-[#ff4f27] fill-[#ff4f27]" strokeWidth={2} />
                    The #1 Reverse Marketplace
                  </div>

                  <h1
                    className="text-white text-[32px] sm:text-[40px] lg:text-[48px] leading-[1.1] tracking-tight mb-6 lg:mb-10 max-w-5xl mx-auto flex flex-col items-center"
                    style={{ fontFamily: 'var(--font-title)', fontWeight: 700 }}
                  >
                    <span>Stop searching</span>
                    <div className="flex items-center gap-x-2 sm:gap-x-3">
                      <span>& start</span>
                      <div className="relative py-1">
                        <span 
                        className="text-[36px] sm:text-[54px] leading-none"
                        style={{ fontFamily: 'var(--font-emoji)' }}
                      >
                        🎯
                      </span>
                      </div>
                      <span>seeking</span>
                    </div>
                  </h1>

                  {/* Description */}
                  <div className="flex flex-col items-center gap-3 mb-10 max-w-md mx-auto">
                    <p className="text-white/85 text-[18px] sm:text-[19px] font-medium leading-[1.4] tracking-tight text-center">
                      {tradeMode === "buy"
                        ? <>{'Shop on your terms.'}<span className="hidden md:inline"><br /></span>{' '}<span>Post what you need, get custom offers from the community, and pick the best deal.</span></>
                        : <>{'Sell on your terms.'}<span className="hidden md:inline"><br /></span>{' '}<span>Browse open requests and send your best offer.</span></>
                      }
                    </p>
                  </div>
                </motion.div>
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
                <div className="w-full max-w-full relative mx-auto">
                  <div className="relative flex flex-col w-full min-h-[90px] h-auto bg-white rounded-2xl px-6 py-6 pb-12 transition-all duration-300 border border-transparent focus-within:border-white/20 shadow-none">
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
                      className="bg-transparent border-none outline-none w-full text-[#1A1A1A] placeholder:text-gray-400 placeholder:text-sm text-sm font-medium resize-none overflow-hidden leading-relaxed"
                    />

                    <Button
                      type="button"
                      variant="accent"
                      onClick={() => {
                        if (searchValue.trim()) {
                          setIsAIFlowOpen(true);
                        } else {
                          window.dispatchEvent(new CustomEvent('open-create-request-modal'));
                        }
                      }}
                      className="absolute bottom-4 right-5 h-8 px-4 gap-1.5 bg-[#1A1A1A] hover:bg-black text-white rounded-full text-[12px] font-bold shadow-none shrink-0"
                    >
                      <span>Post</span>
                      <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" strokeWidth={3} />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    if (user) {
                      router.push('/personal-items');
                    } else {
                      router.push('/signup');
                    }
                  }}
                  size="default"
                  className="h-12 px-8 rounded-full bg-white text-[#6925DC] hover:bg-white/90 text-[15px] font-bold shadow-none transition-all hover:scale-[1.02]"
                >
                  Sell your item
                </Button>
              )}

              {/* Status Indicator */}
              <div className="mt-8 flex items-center justify-center gap-2.5 text-white/50 text-[17px] sm:text-[19px] font-medium tracking-tight">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] shadow-[0_0_8px_rgba(0,255,156,0.6)] animate-pulse" />
                <span>{stats.requestsDaily?.toLocaleString() || 768} requests / 24h</span>
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

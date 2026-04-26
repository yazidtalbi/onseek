"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconX,
  IconChevronDown,
  IconBrandInstagram,
  IconArrowRight
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";
import { COMPETITORS } from "@/lib/compare-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeroSectionV2 } from "@/components/requests/hero-section-v2";
import { AnnouncementBar } from "@/components/landing/announcement-bar";
import { FaqSection } from "@/components/requests/faq-section";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { getCategorySlug } from "@/lib/utils/category-routing";
import { useAuth } from "@/components/layout/auth-provider";

interface LandingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LandingModal({ open, onOpenChange }: LandingModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [tradeMode, setTradeMode] = useState<"buy" | "sell">("buy");
  const modalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add('hero-modal-open');
    } else {
      document.body.classList.remove('hero-modal-open');
    }
    return () => document.body.classList.remove('hero-modal-open');
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#2D00AC]/20 p-4 md:p-12"
    >
      {/* Modal + Footer Wrapper */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onOpenChange(false);
          }
        }}
        className="relative w-full max-w-[768px] flex flex-col gap-6 py-12"
      >
        {/* Floating Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 -right-[20px] w-10 h-10 bg-white rounded-full hidden md:flex items-center justify-center shadow-lg border border-gray-100 group transition-all hover:scale-110 z-[140]"
        >
          <IconX className="w-5 h-5 text-[#6925DC] transition-transform group-hover:rotate-90" />
        </button>

        {/* Modal Body with overflow hidden */}
        <div className="relative w-full bg-[#6925dc] rounded-[20px] md:rounded-tr-none overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col">
          {/* Modal Header */}
          <div className="sticky top-0 z-[110] w-full h-24 bg-transparent flex items-center justify-between px-6 md:px-12">
            <div className="flex items-center gap-10">
              {/* Mobile Logo */}
              <div className="flex md:hidden items-center gap-2">
                <Image
                  src="/logonseek.svg"
                  alt="Onseek"
                  width={24}
                  height={24}
                  className="brightness-0 invert"
                />
                <span className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>Onseek</span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-8">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-pointer group outline-none">
                      <span className="text-[15px] font-bold text-white hover:text-white/80 transition-all" style={{ fontFamily: 'var(--font-expanded)' }}>Explore</span>
                      <IconChevronDown className="w-4 h-4 text-white transition-transform group-hover:translate-y-0.5" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-white rounded-2xl p-2 shadow-xl border-gray-100 z-[160]">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {MAIN_CATEGORIES.map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          className="text-[14px] font-bold text-gray-700 hover:text-[#6925DC] hover:bg-purple-50 rounded-xl cursor-pointer transition-colors py-2.5 px-4"
                          style={{ fontFamily: 'var(--font-expanded)' }}
                          onClick={() => {
                            router.push(`/${getCategorySlug(cat)}`);
                            onOpenChange(false);
                          }}
                        >
                          {cat}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/about" className="text-[15px] font-bold text-white hover:text-white/80 transition-all" style={{ fontFamily: 'var(--font-expanded)' }}>About</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold px-5 border-white/10 shadow-none h-11 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-expanded)' }}
                onClick={() => router.push('/signup')}
              >
                <Image
                  src="/logonseek.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="brightness-0 invert opacity-80 hidden md:block"
                />
                <span>Sign up</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <HeroSectionV2
              user={user}
              profile={profile}
              tradeMode={tradeMode}
              setTradeMode={setTradeMode}
            />
            <AnnouncementBar />

            <div className="flex flex-col w-full bg-white relative">
              <section className="py-12 md:py-20 px-6 md:px-12 overflow-hidden min-h-[60vh] flex flex-col items-start md:items-center">
                <div className="w-full text-center max-w-2xl mx-auto">
                  <h2 className="text-[32px] md:text-[40px] leading-[1.1] mb-6 text-[#1A1A1A] font-black tracking-[-0.02em] mx-auto" style={{ fontFamily: 'var(--font-expanded)' }}>
                    What is Onseek?
                  </h2>
                  <p className="text-lg text-gray-400 font-medium mb-12 md:mb-16 leading-relaxed mx-auto max-w-md">
                    Onseek is a reverse marketplace where buyers state exactly what they need, and sellers compete to offer the best matches.
                  </p>
                </div>

                <div className="flex flex-col max-w-2xl py-10 divide-y divide-gray-100">
                  {/* Feature 1 */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8 group text-left py-12 first:pt-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden">
                      <img src="/illustrations/onseek_magnet_purple.png" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Sellers come to you</h3>
                      <p className="text-base text-gray-400 font-medium leading-relaxed">
                        Define your budget and skip the search. We’ve eliminated the friction of traditional marketplaces by making sellers apply to you.
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8 group text-left py-12">
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden">
                      <img src="/illustrations/onseek_flower_purple.png" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Skip the scroll</h3>
                      <p className="text-base text-gray-400 font-medium leading-relaxed">
                        Your time is valuable. Our request-first model eliminates the friction of traditional marketplaces. Post once, let sellers find you.
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8 group text-left py-12 last:pb-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden">
                      <img src="/illustrations/onseek_city_purple.png" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Marketplace Integrity</h3>
                      <p className="text-base text-gray-400 font-medium leading-relaxed">
                        Through active community inputs and smart moderation, we maintain a marketplace of quality proposals where the best sellers rise to the top.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="w-full bg-transparent pb-12 pt-0">
                <div className="w-full px-4 md:px-6">
                  <FaqSection />
                </div>
              </div>

              <div className="w-full px-4 md:px-6 mb-6 mt-4">
                <div className="w-full bg-[#6925DC] rounded-[24px] py-16 px-6 text-center flex flex-col items-center justify-center gap-6 overflow-hidden relative">
                  <h2 className="relative z-10 text-white text-[24px] md:text-[32px] tracking-tight font-bold leading-tight max-w-md" style={{ fontFamily: 'var(--font-expanded)' }}>
                    Join thousands and discover the new era of shopping
                  </h2>
                  <Button asChild size="lg" className="relative z-10 h-14 px-10 rounded-full bg-white text-[#6925DC] hover:bg-white/90 text-[16px] font-bold mt-4 shadow-none">
                    <Link href="/signup">Join the community</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Section */}
        <div className="w-full bg-[#1A1A1A] rounded-[32px] p-8 md:p-12 flex flex-col gap-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Logo & Intro */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
              <Image
                src="/logonseek.svg"
                alt="Onseek"
                width={32}
                height={32}
                className="brightness-0 invert opacity-90"
              />
            </div>

            {/* Product & Resources Column */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/40" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>Product</h4>
                <nav className="flex flex-col gap-2.5">
                  <Link href="/discover" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">Discover</Link>
                  <Link href="/about" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">About Us</Link>
                </nav>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/40" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>Resources</h4>
                <nav className="flex flex-col gap-2.5">
                  <Link href="/help" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">Help Center</Link>
                  <Link href="/trust" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">Trust & Safety</Link>
                </nav>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-[12px] font-bold uppercase tracking-widest text-white/40" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>Compare</h4>
                <nav className="flex flex-col gap-2.5">
                  {Object.values(COMPETITORS).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/compare/onseek-vs-${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/80 transition-colors text-sm font-semibold"
                    >
                      Onseek vs {c.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Categories Column 1 */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[14px] font-bold text-white/40" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>Explore</h4>
              <nav className="flex flex-col gap-2">
                {MAIN_CATEGORIES.slice(0, 8).map((category) => (
                  <Link
                    key={category}
                    href={`/${getCategorySlug(category)}`}
                    className="text-sm text-white hover:text-white/80 transition-colors font-semibold"
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Categories Column 2 */}
            <div className="flex flex-col gap-3 pt-[28px] md:pt-[32px]">
              <nav className="flex flex-col gap-2">
                {MAIN_CATEGORIES.slice(8).map((category) => (
                  <Link
                    key={category}
                    href={`/${getCategorySlug(category)}`}
                    className="text-sm text-white hover:text-white/80 transition-colors font-semibold"
                  >
                    {category}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-8 border-t border-white/[0.01] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <p className="text-xs text-white/40 font-medium">© 2026 Onseek</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex gap-4">
                <Link href="/privacy" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">Privacy</Link>
                <Link href="/terms" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">Terms</Link>
                <Link href="/cookies" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">Cookies</Link>
              </div>
              <div className="flex gap-4 items-center">
                <a href="https://instagram.com/onseek.co" target="_blank" className="text-white hover:text-white/80 transition-colors">
                  <IconBrandInstagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, LockKeyhole, Crown } from "lucide-react";

interface AuthCardLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthCardLayout({
  children,
  title,
  description
}: AuthCardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f6f9] flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Brand Logo - Top Left */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="onseek" width={100} height={24} className="h-6 w-auto" priority />
          <span className="text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
            onseek
          </span>
        </Link>
      </div>

      <div className="max-w-[880px] w-full bg-white rounded-[1.5rem] shadow-none border-none overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-6 py-8 md:px-10 md:pt-10 md:pb-6 w-full">
          <div className="flex flex-col md:flex-row gap-10 lg:gap-14 items-stretch w-full">
            {/* Left column: Forms */}
            <div className="w-full md:w-[380px] shrink-0 flex flex-col">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-expanded)' }}>
                  {title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[320px]">
                  {description}
                </p>
              </div>
              
              <div className="flex-1">
                {children}
              </div>
            </div>

            {/* Right column: Perks Section */}
            <div className="hidden md:flex flex-1 min-w-0">
              <div className="p-8 lg:p-10 rounded-[1.5rem] bg-gray-50 h-full flex flex-col justify-center">
                <div className="mb-8 flex items-center gap-3">
                  <h3 className="text-lg lg:text-xl font-semibold text-[#222234]" style={{ fontFamily: 'var(--font-expanded)' }}>Join the community</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: <ShieldCheck className="h-5 w-5 text-green-500" />, title: "Verified Sellers", desc: "Buy with confidence from vetted professionals." },
                    { icon: <Sparkles className="h-5 w-5 text-[#7755FF]" />, title: "Private Matches", desc: "Get exclusive offers for your specific request." },
                    { icon: <LockKeyhole className="h-5 w-5 text-orange-500" />, title: "Secure Deals", desc: "Your data and payments are always protected." },
                    { icon: <Crown className="h-5 w-5 text-yellow-500" />, title: "Premium Access", desc: "First-look at rare items before they hit the feed." }
                  ].map((perk, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="shrink-0 mt-0.5">{perk.icon}</div>
                      <div>
                        <p className="font-semibold text-[#222234] text-sm mb-0.5" style={{ fontFamily: 'var(--font-expanded)' }}>{perk.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{perk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-gray-200/50 flex items-center gap-4">
                  <div className="flex -space-x-3 items-center">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-10 bg-cover bg-center"
                        style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=user${i + 20})` }} />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#7755FF] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+</div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium tracking-tight">Joined by 50,000+ members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

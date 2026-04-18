"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="w-full px-4 md:px-6 mt-6 mb-4">
      <Link 
        href="/signup"
        className="group relative flex items-center justify-between mx-auto w-full max-w-[1280px] h-14 px-8 rounded-[20px] overflow-hidden transition-all"
      >
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5fbea] via-[#eef9e4] to-[#e4f9e0]" />
        
        <div className="relative flex items-center gap-4">
          <span className="text-[15px] font-semibold text-emerald-900 tracking-tight">
            Got what they&apos;re looking for? Turn requests into sales by joining our seller community.
          </span>
        </div>
        
        <div className="relative flex items-center gap-1.5 text-[15px] font-bold text-emerald-700 underline underline-offset-4 decoration-emerald-200 group-hover:decoration-emerald-400 transition-all shrink-0">
          Get started
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </div>
  );
}

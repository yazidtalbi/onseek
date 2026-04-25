"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { getCategorySlug } from "@/lib/utils/category-routing";
import { COMPETITORS } from "@/lib/compare-data";

export function PublicFooter() {
  return (
    <footer className="bg-[#222234] text-white pt-24 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-8">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Image 
                src="/logo-final.svg" 
                alt="Onseek" 
                width={32} 
                height={32} 
                className="brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-xl text-white font-bold tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Onseek</span>
            </Link>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed font-medium">
              Onseek is a request-first marketplace for people who have better things to do than scroll. We bridge the gap between intent and expert sources, so you can post a request, close the tab, and let the deals find you.
            </p>
            <div className="pt-2">
              <a 
                href="https://www.instagram.com/onseek.co/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition-all group/insta"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover/insta:bg-white/10 transition-colors">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-50 group-hover/insta:opacity-100 transition-opacity">Follow Us</span>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-expanded)' }}>Explore</h4>
            <ul className="grid grid-cols-1 gap-4">
              {MAIN_CATEGORIES.slice(0, 16).map((category) => (
                <li key={category}>
                  <Link href={`/category/${getCategorySlug(category)}`} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comparison Directory — helps Google crawl all pSEO pages */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-expanded)' }}>Compare</h4>
            <ul className="space-y-4">
              {Object.values(COMPETITORS).map((c) => (
                <li key={c.slug}>
                  <Link href={`/compare/onseek-vs-${c.slug}`} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                    Onseek vs {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-expanded)' }}>Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Privacy Policy</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Help Center</Link></li>
              <li><Link href="/feedback" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Feedback</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Giant wordmark — Guaranteed edge-to-edge via vw font size */}
      <div className="w-full overflow-hidden select-none mt-8 text-center pb-12 border-b border-white/[0.03]">
        <Link 
          href="/" 
          className="inline-block w-full text-white hover:text-white/90 transition-colors duration-500 font-bold tracking-[-0.05em] leading-none whitespace-nowrap"
          style={{ 
            fontFamily: 'var(--font-expanded)',
            fontSize: '28.5vw',
            letterSpacing: '-0.07em',
            lineHeight: '0.8',
            marginBottom: '-0.1em'
          }}
        >
          Onseek
        </Link>
      </div>

      {/* Bottom bar — Reorganized with Social Icons */}
      <div className="w-full px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-[#222234]">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <p className="text-gray-500 text-[13px] font-medium order-2 md:order-1">
            © 2026 Onseek Global LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6 order-1 md:order-2">
            <Link href="/privacy" className="text-[13px] font-medium text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[13px] font-medium text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-[13px] font-medium text-gray-500 hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


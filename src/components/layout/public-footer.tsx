"use client";

import Link from "next/link";
import { Github, Twitter, Instagram, Linkedin, Youtube, Facebook } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { getCategorySlug } from "@/lib/utils/category-routing";
import { COMPETITORS } from "@/lib/compare-data";

export function PublicFooter() {
  return (
    <footer className="bg-[#222234] text-white pt-24 pb-12">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-24">
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <Link href="/" className="text-3xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity" style={{ fontFamily: 'var(--font-expanded)' }}>
              onseek
            </Link>
            <p className="text-gray-400 max-w-sm text-lg leading-relaxed font-light">
              The fastest way to crowdsource purchase links from an expert community. Request anything, find it instantly.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-all transform hover:scale-110"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-all transform hover:scale-110"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-all transform hover:scale-110"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-all transform hover:scale-110"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-all transform hover:scale-110"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-expanded)' }}>Explore</h4>
            <ul className="grid grid-cols-1 gap-4">
              {MAIN_CATEGORIES.slice(0, 8).map((category) => (
                <li key={category}>
                  <Link href={`/category/${getCategorySlug(category)}`} className="text-gray-400 hover:text-white transition-colors text-base font-medium">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-expanded)' }}>Discover</h4>
            <ul className="space-y-4">
              {MAIN_CATEGORIES.slice(8, 16).map((category) => (
                <li key={category}>
                  <Link href={`/category/${getCategorySlug(category)}`} className="text-gray-400 hover:text-white transition-colors text-base font-medium">
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
                  <Link href={`/compare/onseek-vs-${c.slug}`} className="text-gray-400 hover:text-white transition-colors text-base font-medium">
                    Onseek vs {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-white text-sm uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-expanded)' }}>Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-base font-medium">About Us</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-base font-medium">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-base font-medium">Privacy Policy</Link></li>
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors text-base font-medium">Help Center</Link></li>
              <li><Link href="/feedback" className="text-gray-400 hover:text-white transition-colors text-base font-medium">Feedback</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm font-medium">
            © 2026 Onseek Global LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-gray-500 hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


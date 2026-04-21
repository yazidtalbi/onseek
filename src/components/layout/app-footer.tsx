"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";
import { getCategorySlug } from "@/lib/utils/category-routing";

export function AppFooter() {
  return (
    <footer className="bg-[#222234] text-white mt-12 border-t border-white/10">
      <div className="w-full px-6 pt-16 pb-8 md:px-12">
        {/* Links Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-16">
          {/* Column 1: App Pages */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: 'var(--font-expanded)' }}>App</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/new" className="text-sm text-gray-400 hover:text-white transition-colors">Create a Request</Link>
              <Link href="/requests" className="text-sm text-gray-400 hover:text-white transition-colors">My Requests</Link>
              <Link href="/submissions" className="text-sm text-gray-400 hover:text-white transition-colors">Proposals</Link>
              <Link href="/personal-items" className="text-sm text-gray-400 hover:text-white transition-colors">Inventory</Link>
              <Link href="/saved" className="text-sm text-gray-400 hover:text-white transition-colors">Saved</Link>
              <Link href="/notifications" className="text-sm text-gray-400 hover:text-white transition-colors">Notifications</Link>
              <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
            </nav>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: 'var(--font-expanded)' }}>Categories</h4>
            <nav className="flex flex-col gap-3">
              {MAIN_CATEGORIES.slice(0, 8).map((category) => (
                <Link
                  key={category}
                  href={`/category/${getCategorySlug(category)}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: About & Support */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: 'var(--font-expanded)' }}>Support</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link>
              <Link href="/help" className="text-sm text-gray-400 hover:text-white transition-colors">Help & Support</Link>
              <Link href="/feedback" className="text-sm text-gray-400 hover:text-white transition-colors">Feedback</Link>
              <Link href="/trust" className="text-sm text-gray-400 hover:text-white transition-colors">Trust & Safety</Link>
              <Link href="/foundation" className="text-sm text-gray-400 hover:text-white transition-colors">Foundation</Link>
            </nav>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: 'var(--font-expanded)' }}>Legal</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
              <Link href="/accessibility" className="text-sm text-gray-400 hover:text-white transition-colors">Accessibility</Link>
            </nav>
          </div>

          {/* Column 5: Social & App */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: 'var(--font-expanded)' }}>Follow Us</h4>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.instagram.com/onseek.co/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: 'var(--font-expanded)' }}>Get the App</h4>
              <div className="flex items-center gap-4">
                <a href="#" className="text-2xl hover:opacity-80 transition-opacity">🍎</a>
                <a href="#" className="text-2xl hover:opacity-80 transition-opacity">🤖</a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">
            © 2026 <span className="text-white">onseek</span>® Global LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Privacy</Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Terms</Link>
            <Link href="/cookies" className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { COMPETITORS } from "@/lib/compare-data";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { InterceptBanner } from "@/components/requests/intercept-banner";

export const metadata: Metadata = {
  title: "Onseek vs. Competitors: The Request-First Marketplace Comparison",
  description:
    "See how Onseek's intent-driven model compares to Google Shopping, Facebook Marketplace, eBay, Amazon, and Craigslist. Stop searching, start receiving.",
  alternates: {
    canonical: "https://onseek.co/compare",
  },
};

export default function CompareIndexPage() {
  const competitors = Object.values(COMPETITORS);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <main className="max-w-[1360px] mx-auto px-6 pt-32 pb-24">
        {/* Hero Section */}
        <div className="max-w-3xl mb-20">
          <h1
            className="text-[48px] sm:text-[72px] font-black tracking-[-0.04em] text-[#1A1A1A] leading-[0.95] mb-8"
            style={{ fontFamily: "var(--font-expanded)" }}
          >
            Onseek vs. <br/>Everyone.
          </h1>
          <p className="text-[20px] text-gray-500 leading-snug font-medium max-w-xl">
            The search-first model is broken. Explore how Onseek's
            request-first approach compares to the platforms you already use.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {competitors.map((competitor) => (
            <Link
              key={competitor.slug}
              href={`/compare/onseek-vs-${competitor.slug}`}
              className="group relative flex flex-col rounded-[32px] overflow-hidden bg-white border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-[#7755FF]/10 hover:-translate-y-1"
            >
              {/* Visual Header */}
              <div 
                className="relative h-48 flex items-center justify-center gap-6 overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: `${competitor.accentColor}10` }}
              >
                {/* Onseek Logo */}
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center p-3 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <img src="/logonseek.svg" alt="Onseek" className="w-full h-auto" />
                </div>

                <div className="text-black/5 font-black text-2xl relative z-10">VS</div>

                {/* Competitor Logo */}
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center p-3 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <img 
                    src={`/brands/${competitor.slug}${["amazon", "craigslist", "ebay"].includes(competitor.slug) ? ".svg" : ".png"}`} 
                    alt={competitor.name} 
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Pattern Overlay */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20"
                  style={{ 
                    maskImage: 'url(/illustrations/turing-pattern.png)',
                    maskSize: '600px',
                    backgroundColor: competitor.accentColor
                  }}
                />
              </div>

              {/* Card Content */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 rounded bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Onseek
                  </span>
                  <span className="px-2 py-1 rounded bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {competitor.name}
                  </span>
                </div>

                <h2 
                  className="text-[24px] font-black text-[#1A1A1A] mb-3 leading-tight group-hover:text-[#7755FF] transition-colors"
                  style={{ fontFamily: "var(--font-expanded)" }}
                >
                  Onseek vs {competitor.name}
                </h2>
                <p className="text-[15px] text-gray-500 leading-relaxed line-clamp-2">
                  {competitor.tagline}
                </p>

                <div className="mt-auto pt-6 flex justify-end">
                   <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#7755FF] group-hover:text-white transition-all duration-300">
                      <ArrowRight className="h-5 w-5" />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-32">
          <InterceptBanner />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

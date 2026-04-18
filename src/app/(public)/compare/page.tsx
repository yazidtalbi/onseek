import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPETITORS } from "@/lib/compare-data";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata: Metadata = {
  title: "Onseek vs. Competitors: The Request-First Marketplace Comparison",
  description:
    "See how Onseek's intent-driven model compares to Google Shopping, Facebook Marketplace, eBay, Amazon, and Craigslist. Stop searching — start receiving.",
  alternates: {
    canonical: "https://onseek.com/compare",
  },
};

export default function CompareIndexPage() {
  const competitors = Object.values(COMPETITORS);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <main className="max-w-[1280px] mx-auto px-6 py-20">
        {/* Hero */}
        <div className="max-w-2xl mb-16">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Comparison Directory
          </p>
          <h1
            className="text-[40px] sm:text-[52px] font-bold tracking-[-0.03em] text-[#1A1A1A] leading-[1.05] mb-5"
            style={{ fontFamily: "var(--font-title)" }}
          >
            Onseek vs. Everyone.
          </h1>
          <p className="text-[17px] text-gray-500 leading-relaxed">
            The search-first model is broken. Explore how Onseek's
            request-first approach compares to the platforms you already use.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {competitors.map((competitor) => (
            <Link
              key={competitor.slug}
              href={`/compare/onseek-vs-${competitor.slug}`}
              className="group rounded-2xl border border-gray-100 p-7 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-center justify-between mb-5">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: competitor.accentColor }}
                >
                  {competitor.category}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${competitor.accentColor}15` }}
                >
                  <ArrowRight className="h-4 w-4" style={{ color: competitor.accentColor }} />
                </div>
              </div>

              <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-2 tracking-tight">
                Onseek vs {competitor.name}
              </h2>
              <p className="text-[13px] text-gray-400 leading-relaxed">
                {competitor.tagline}
              </p>

              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-gray-500">
                  ★ {competitor.schemaRating} · {competitor.schemaReviewCount.toLocaleString()} reviews
                </span>
                <span
                  className="text-[12px] font-bold group-hover:underline"
                  style={{ color: competitor.accentColor }}
                >
                  Read comparison →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

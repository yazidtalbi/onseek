import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import { getCompetitor, getRelatedCompetitors, ALL_COMPETITOR_SLUGS } from "@/lib/compare-data";
import { StickyNav } from "@/components/compare/sticky-nav";
import { ScrollProgress } from "@/components/compare/scroll-progress";
import { FaqAccordion } from "@/components/compare/faq-accordion";
import { InterceptBanner } from "@/components/requests/intercept-banner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Static Generation ───────────────────────────────────────────────────────

export function generateStaticParams() {
  return ALL_COMPETITOR_SLUGS.map((slug) => ({ slug }));
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitor = getCompetitor(slug);
  if (!competitor) return {};

  const title = `Onseek vs ${competitor.name}: Why Request-First is the Future of ${competitor.category}`;

  return {
    title,
    description: competitor.metaDescription,
    alternates: {
      canonical: `https://onseek.co/compare/onseek-vs-${slug}`,
    },
    openGraph: {
      title,
      description: competitor.metaDescription,
      type: "website",
      url: `https://onseek.co/compare/onseek-vs-${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: competitor.metaDescription,
    },
  };
}

// ─── JSON-LD Schema ───────────────────────────────────────────────────────────

function JsonLdSchema({ competitor }: { competitor: ReturnType<typeof getCompetitor> }) {
  if (!competitor) return null;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: "Onseek",
        description:
          "The request-first marketplace. Post what you need, receive verified proposals from sellers who match exactly.",
        brand: { "@type": "Brand", name: "Onseek" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: competitor.schemaRating,
          reviewCount: competitor.schemaReviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: competitor.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://onseek.co" },
          { "@type": "ListItem", position: 2, name: "Compare", item: "https://onseek.co/compare" },
          {
            "@type": "ListItem",
            position: 3,
            name: `Onseek vs ${competitor.name}`,
            item: `https://onseek.co/compare/onseek-vs-${competitor.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CompareDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const competitor = getCompetitor(slug);
  if (!competitor) notFound();

  const related = getRelatedCompetitors(slug);

  return (
    <>
      <JsonLdSchema competitor={competitor} />

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white relative">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img src="/logonseek.svg" alt="Onseek Logo" className="h-6 w-auto" />
            <span className="text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 700 }}>Onseek</span>
          </Link>

          {/* CTA */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold text-[#7755FF] border-2 border-[#7755FF] bg-transparent transition-all hover:bg-[#7755FF]/5 hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to app
          </Link>
        </div>

        {/* Scroll progress line */}
        <ScrollProgress color="#7755FF" />
      </header>

      <main className="bg-white">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-white">
          <div className="max-w-[1100px] mx-auto px-6 pt-16 pb-12 text-center">
            {/* H1 */}
            <h1
              className="text-[42px] sm:text-[56px] font-black leading-[1.1] tracking-[-0.03em] text-[#1A1A1A] mb-8 max-w-[900px] mx-auto"
              style={{ fontFamily: "var(--font-expanded)" }}
            >
              Onseek vs {competitor.name}: {competitor.tagline}
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8">
              {competitor.heroSubheadline}
            </p>

            {/* Comparison Visual Block */}
            <div
              className="relative rounded-3xl py-24 px-12 mb-16 overflow-hidden"
              style={{ backgroundColor: `${competitor.accentColor}10` }}
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 relative z-10">
                {/* Onseek Side */}
                <div className="flex flex-col items-center gap-4 relative">
                  <div className="w-32 h-32 bg-white rounded-3xl shadow-sm flex items-center justify-center p-6">
                    <img src="/logonseek.svg" alt="Onseek" className="w-full h-auto" />
                  </div>
                  <span className="text-[13px] font-bold text-[#7755FF]">Onseek</span>
                </div>

                {/* VS */}
                <div className="text-gray-400 font-bold text-xl uppercase tracking-widest pt-2">vs</div>

                {/* Competitor Side */}
                <div className="flex flex-col items-center gap-4 relative">
                  <div className="w-32 h-32 bg-white rounded-3xl shadow-sm flex items-center justify-center p-6">
                    <img
                      src={`/brands/${competitor.slug}${["amazon", "craigslist", "ebay"].includes(competitor.slug) ? ".svg" : ".png"}`}
                      alt={competitor.name}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <span 
                    className="text-[13px] font-bold text-[#7755FF]"
                  >
                    {competitor.name}
                  </span>
                </div>
              </div>

              {/* Turing pattern overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{ 
                  maskImage: 'url(/illustrations/turing-pattern.png)',
                  maskSize: '1200px',
                  backgroundColor: competitor.accentColor
                }}
              />
            </div>


          </div>
        </section>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="max-w-[1100px] mx-auto px-6 py-16">
          <div className="flex gap-16 items-start">
            {/* Left / Center (65%) */}
            <div className="flex-1 min-w-0 space-y-20">

              {/* Section 1: The Conflict */}
              <section id="conflict" className="scroll-mt-24">
                <h2
                  className="text-[32px] sm:text-[40px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-expanded)" }}
                >
                  The problem with {competitor.name}
                </h2>
                <div className="space-y-4">
                  {competitor.conflictBody.map((paragraph, i) => (
                    <p key={i} className="text-lg text-gray-700 leading-[1.8]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Functional Gap Visual */}
                <div className="mt-10 grid sm:grid-cols-2 gap-4">
                  {/* Competitor block */}
                  <div className="rounded-xl border border-gray-200 p-6 bg-[#fafafa]">
                    <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                      {competitor.name}
                    </p>
                    <ul className="space-y-3">
                      {["You scroll endlessly", "Sellers ignore you", "No price structure", "No accountability"].map((pain, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-[14px] text-gray-400">
                          <X className="h-4 w-4 text-gray-300 shrink-0" strokeWidth={2.5} />
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Onseek block */}
                  <div
                    className="rounded-xl border-2 p-6 bg-white"
                    style={{ borderColor: "#7755FF33" }}
                  >
                    <p
                      className="text-[12px] font-bold uppercase tracking-widest mb-4 text-[#7755FF]"
                    >
                      Onseek
                    </p>
                    <ul className="space-y-3">
                      {["You post once", "Sellers compete for you", "Budget set by you", "Structured accountability"].map((win, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-[14px] text-[#1A1A1A] font-medium">
                          <Check className="h-4 w-4 shrink-0 text-[#7755FF]" strokeWidth={3} />
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 2: Comparison Table */}
              <section id="comparison" className="scroll-mt-24">
                <h2
                  className="text-[32px] sm:text-[40px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-expanded)" }}
                >
                  Feature Comparison
                </h2>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Header row */}
                  <div className="grid grid-cols-3 border-b border-gray-100 bg-[#fafafa]">
                    <div className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400">
                      Feature
                    </div>
                    <div className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-gray-400 text-center border-l border-gray-100">
                      {competitor.name}
                    </div>
                    <div
                      className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-center border-l border-gray-100 text-[#7755FF]"
                    >
                      Onseek
                    </div>
                  </div>

                  {/* Data rows */}
                  {competitor.tableRows.map((row, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-3 border-b border-gray-100 last:border-b-0 ${i % 2 === 1 ? "bg-[#fafafa]/50" : "bg-white"
                        }`}
                    >
                      <div className="px-5 py-4 text-base font-medium text-[#1A1A1A]">
                        {row.feature}
                      </div>
                      <div className="px-5 py-4 border-l border-gray-100 flex items-center justify-center">
                        {row.competitor === true ? (
                          <Check className="h-4 w-4 text-gray-400" strokeWidth={3} />
                        ) : row.competitor === false ? (
                          <X className="h-4 w-4 text-gray-200" strokeWidth={2.5} />
                        ) : (
                          <span className="text-[13px] font-medium text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            {row.competitor}
                          </span>
                        )}
                      </div>
                      <div className="px-5 py-4 border-l border-gray-100 flex items-center justify-center">
                        {row.onseek === true ? (
                          <Check
                            className="h-4 w-4 text-[#7755FF]"
                            strokeWidth={3}
                          />
                        ) : row.onseek === false ? (
                          <X className="h-4 w-4 text-gray-200" strokeWidth={2.5} />
                        ) : (
                          <span
                            className="text-[13px] font-medium px-2.5 py-0.5 rounded-full text-[#7755FF] bg-[#7755FF15]"
                          >
                            {row.onseek}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* How it Works */}
              <section id="how-it-works" className="scroll-mt-24">
                <h2
                  className="text-[32px] sm:text-[40px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-10 leading-tight"
                  style={{ fontFamily: "var(--font-expanded)" }}
                >
                  Why intent beats search
                </h2>

                <div className="space-y-0">
                  {[
                    {
                      icon: Target,
                      step: "01",
                      title: "Post your request",
                      body: "Define what you need in plain language. Include your budget, condition requirements, location, and any specific preferences. Takes 60 seconds.",
                    },
                    {
                      icon: Zap,
                      step: "02",
                      title: "Sellers come to you",
                      body: "Verified community members submit structured proposals that match your exact requirements. No browsing. No cold-messaging. You set the terms.",
                    },
                    {
                      icon: Shield,
                      step: "03",
                      title: "Pick your winner",
                      body: "Compare proposals side-by-side. Every submission includes price, seller rating, and shipping details. Choose the best fit and complete the transaction on your timeline.",
                    },
                  ].map(({ icon: Icon, step, title, body }, i) => (
                    <div
                      key={i}
                      className={`flex gap-6 py-8 ${i !== 2 ? "border-b border-gray-100" : ""}`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#7755FF15]"
                      >
                        <Icon
                          className="h-5 w-5 text-[#7755FF]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                            Step {step}
                          </span>
                        </div>
                        <h3 className="text-[17px] font-semibold text-[#1A1A1A] mb-1.5">
                          {title}
                        </h3>
                        <p className="text-lg text-gray-700 leading-[1.8]">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 4: Use Cases */}
              <section id="use-cases" className="scroll-mt-24">
                <h2
                  className="text-[32px] sm:text-[40px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-expanded)" }}
                >
                  What people are finding on Onseek
                  <br />
                  instead of {competitor.name}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {competitor.useCaseCards.map((card, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 p-6 hover:border-gray-200 transition-colors bg-white group"
                    >
                      <div className="text-3xl mb-4" style={{ fontFamily: "var(--font-emoji)" }}>{card.icon}</div>
                      <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-2">
                        {card.title}
                      </h3>
                      <p className="text-lg text-gray-700 leading-[1.8]">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 5: FAQ */}
              <section id="faq" className="scroll-mt-24">
                <h2
                  className="text-[32px] sm:text-[40px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-expanded)" }}
                >
                  Frequently Asked Questions
                </h2>
                <FaqAccordion items={competitor.faqs} />
              </section>

            </div>

            {/* Right sticky nav (35%) */}
            <StickyNav accentColor="#7755FF" />
          </div>

          {/* Other Comparisons Section */}
          <section className="pt-24 mt-20 border-t border-gray-100">
            <h2
              className="text-[28px] font-bold text-[#1A1A1A] mb-10"
              style={{ fontFamily: "var(--font-expanded)" }}
            >
              Other comparisons
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/compare/onseek-vs-${rel.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                >
                  {/* Card Image Area (Hero Miniaturized) */}
                  <div 
                    className="aspect-[16/9] w-full flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: `${rel.accentColor}15` }}
                  >
                    {/* Organic Pattern Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{ 
                      backgroundColor: rel.accentColor,
                      WebkitMaskImage: `url("/illustrations/turing-pattern.png")`,
                      maskImage: `url("/illustrations/turing-pattern.png")`,
                      WebkitMaskSize: '400px 400px',
                      maskSize: '400px 400px',
                      WebkitMaskRepeat: 'repeat',
                      maskRepeat: 'repeat'
                    }}></div>

                    <div className="flex items-center gap-6 relative z-10 scale-90">
                      {/* Onseek Side */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2.5">
                          <img src="/logonseek.svg" alt="Onseek" className="w-full h-auto" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500/80 uppercase tracking-wider">Onseek</span>
                      </div>

                      {/* VS */}
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-[-14px]">vs</div>

                      {/* Competitor Side */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center p-2.5">
                          <img 
                            src={`/brands/${rel.slug}${["amazon", "craigslist", "ebay"].includes(rel.slug) ? ".svg" : ".png"}`} 
                            alt={rel.name} 
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500/80 uppercase tracking-wider">{rel.name.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 
                      className="text-[20px] font-bold text-[#1A1A1A] mb-2 leading-tight group-hover:text-[#7755FF] transition-colors"
                      style={{ fontFamily: "var(--font-title)" }}
                    >
                      Onseek vs {rel.name}
                    </h3>
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-2">
                      {rel.tagline}
                    </p>
                    <div className="mt-auto flex items-center gap-2">
                      <span className="inline-flex px-2 py-1 rounded bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Onseek
                      </span>
                      <span 
                        className="inline-flex px-2 py-1 rounded bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                      >
                        {rel.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer CTA Banner ────────────────────────────────────────────── */}
        <div className="mt-10 mb-[-40px]">
          <div className="max-w-[1100px] mx-auto py-12">
            <InterceptBanner />
          </div>
        </div>
      </main>
    </>
  );
}

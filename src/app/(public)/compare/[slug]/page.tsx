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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 relative">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-bold text-[#1A1A1A] tracking-tight"
            style={{ fontFamily: "var(--font-expanded)" }}
          >
            Onseek
          </Link>

          {/* CTA */}
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: competitor.accentColor }}
          >
            Post a Request
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Scroll progress line */}
        <ScrollProgress color={competitor.accentColor} />
      </header>

      <main className="bg-white">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="border-b border-gray-100 bg-[#fafafa]">
          <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-16">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/compare" className="hover:text-gray-700 transition-colors">Compare</Link>
              <span>/</span>
              <span className="text-[#1A1A1A] font-medium">{competitor.name}</span>
            </nav>

            <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-start">
              <div className="space-y-6 max-w-2xl">
                {/* Category pill */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: competitor.accentColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  {competitor.category}
                </span>

                {/* H1 */}
                <h1
                  className="text-[36px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.03em] text-[#1A1A1A]"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  Stop Searching.
                  <br />
                  <span style={{ color: competitor.accentColor }}>Start Receiving.</span>
                </h1>

                <p className="text-[17px] text-gray-500 leading-relaxed max-w-xl">
                  {competitor.heroSubheadline}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: competitor.accentColor }}
                  >
                    Post your first request in 60 seconds
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-[#1A1A1A] border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    Browse live requests
                  </Link>
                </div>
              </div>

              {/* Visual comparison */}
              <div className="hidden lg:flex flex-col gap-3 w-[340px] shrink-0">
                {/* Competitor side – muted */}
                <div className="rounded-2xl border border-gray-200 p-5 opacity-40 bg-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    {competitor.name} — Typical result
                  </p>
                  <div className="space-y-2">
                    {["Item 1 - seller inactive", "Item 2 - overpriced", "Item 3 - wrong condition"].map((l, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px] text-gray-400">
                        <X className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Onseek side – bold */}
                <div
                  className="rounded-2xl border-2 p-5 bg-white shadow-lg"
                  style={{ borderColor: competitor.accentColor }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: competitor.accentColor }}>
                      Onseek request card
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: competitor.accentColor }}>
                      ✓ Winner
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold text-[#1A1A1A] leading-snug mb-3">
                    Find a Sony WH-1000XM5 under $280, ships UK, new condition
                  </p>
                  <div className="space-y-1.5">
                    {["Budget defined upfront", "3 matched proposals", "Verified sellers only"].map((l, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px] text-gray-600">
                        <Check className="h-3.5 w-3.5 shrink-0" style={{ color: competitor.accentColor }} strokeWidth={3} />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="max-w-[1280px] mx-auto px-6 py-16">
          <div className="flex gap-16 items-start">
            {/* Left / Center — 65% */}
            <div className="flex-1 min-w-0 space-y-20">

              {/* Section 1: The Conflict */}
              <section id="conflict" className="scroll-mt-24">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  Section 01
                </span>
                <h2
                  className="text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-6 leading-tight"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  The problem with {competitor.name}.
                </h2>
                <div className="space-y-4">
                  {competitor.conflictBody.map((paragraph, i) => (
                    <p key={i} className="text-[15px] text-gray-500 leading-relaxed">
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
                    style={{ borderColor: `${competitor.accentColor}33` }}
                  >
                    <p
                      className="text-[12px] font-bold uppercase tracking-widest mb-4"
                      style={{ color: competitor.accentColor }}
                    >
                      Onseek
                    </p>
                    <ul className="space-y-3">
                      {["You post once", "Sellers compete for you", "Budget set by you", "Structured accountability"].map((win, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-[14px] text-[#1A1A1A] font-medium">
                          <Check className="h-4 w-4 shrink-0" style={{ color: competitor.accentColor }} strokeWidth={3} />
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 2: Comparison Table */}
              <section id="comparison" className="scroll-mt-24">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  Section 02
                </span>
                <h2
                  className="text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  Feature Comparison.
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
                      className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-center border-l border-gray-100"
                      style={{ color: competitor.accentColor }}
                    >
                      Onseek
                    </div>
                  </div>

                  {/* Data rows */}
                  {competitor.tableRows.map((row, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-3 border-b border-gray-100 last:border-b-0 ${
                        i % 2 === 1 ? "bg-[#fafafa]/50" : "bg-white"
                      }`}
                    >
                      <div className="px-5 py-4 text-[14px] font-medium text-[#1A1A1A]">
                        {row.feature}
                      </div>
                      <div className="px-5 py-4 border-l border-gray-100 flex items-center justify-center">
                        {row.competitor === true ? (
                          <Check className="h-4 w-4 text-gray-400" strokeWidth={3} />
                        ) : row.competitor === false ? (
                          <X className="h-4 w-4 text-gray-200" strokeWidth={2.5} />
                        ) : (
                          <span className="text-[12px] font-medium text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            {row.competitor}
                          </span>
                        )}
                      </div>
                      <div className="px-5 py-4 border-l border-gray-100 flex items-center justify-center">
                        {row.onseek === true ? (
                          <Check
                            className="h-4 w-4"
                            style={{ color: competitor.accentColor }}
                            strokeWidth={3}
                          />
                        ) : row.onseek === false ? (
                          <X className="h-4 w-4 text-gray-200" strokeWidth={2.5} />
                        ) : (
                          <span
                            className="text-[12px] font-medium px-2.5 py-0.5 rounded-full"
                            style={{
                              color: competitor.accentColor,
                              backgroundColor: `${competitor.accentColor}15`,
                            }}
                          >
                            {row.onseek}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: How it Works */}
              <section id="how-it-works" className="scroll-mt-24">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  Section 03
                </span>
                <h2
                  className="text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-10 leading-tight"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  Why intent beats search.
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
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${competitor.accentColor}15` }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: competitor.accentColor }}
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
                        <p className="text-[14px] text-gray-500 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 4: Use Cases */}
              <section id="use-cases" className="scroll-mt-24">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  Section 04
                </span>
                <h2
                  className="text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  What people are finding on Onseek
                  <br />
                  instead of {competitor.name}.
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {competitor.useCaseCards.map((card, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 p-6 hover:border-gray-200 transition-colors bg-white group"
                    >
                      <div className="text-3xl mb-4">{card.icon}</div>
                      <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-2">
                        {card.title}
                      </h3>
                      <p className="text-[13px] text-gray-500 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 5: FAQ */}
              <section id="faq" className="scroll-mt-24">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  Section 05
                </span>
                <h2
                  className="text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-title)" }}
                >
                  Frequently Asked Questions.
                </h2>
                <FaqAccordion items={competitor.faqs} />
              </section>

              {/* Internal Links — other comparisons */}
              <section className="pt-4 border-t border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-5">
                  More comparisons
                </p>
                <div className="flex flex-wrap gap-3">
                  {related.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/compare/onseek-vs-${rel.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-[13px] font-medium text-[#1A1A1A] hover:border-gray-400 transition-colors"
                    >
                      Onseek vs {rel.name}
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Right sticky nav — 35% */}
            <StickyNav accentColor={competitor.accentColor} />
          </div>
        </div>

        {/* ── Footer CTA Banner ────────────────────────────────────────────── */}
        <div className="border-t border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 py-16 text-center">
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              Ready to switch?
            </p>
            <h2
              className="text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-[#1A1A1A] mb-4"
              style={{ fontFamily: "var(--font-title)" }}
            >
              Post your first request in 60 seconds.
            </h2>
            <p className="text-[15px] text-gray-500 mb-8 max-w-md mx-auto">
              Free to use. No account needed to browse. Verified proposals start arriving within hours.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: competitor.accentColor }}
            >
              Get started — it's free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLandingPageContent } from "@/lib/strapi/content";

// Default fallback content
const defaultContent = {
  heroBadge: "Community-powered product hunting",
  heroTitle: "Request anything. Get the best buying links in minutes.",
  heroDescription:
    "Onseek is the fastest way to crowdsource purchase links. Post a request, receive vetted submissions, and pick the winning find.",
  ctaPrimaryText: "Start a request",
  ctaPrimaryLink: "/signup",
  ctaSecondaryText: "Explore live requests",
  ctaSecondaryLink: "/app",
  features: [
    {
      id: 1,
      title: "Post",
      description: "Describe what you need and your budget.",
    },
    {
      id: 2,
      title: "Get links",
      description: "Hunters submit verified links with notes.",
    },
    {
      id: 3,
      title: "Choose",
      description: "Pick a winner and boost their reputation.",
    },
  ],
  sampleRequest: {
    id: 1,
    title: "Find a quiet mechanical keyboard under $120",
    description:
      "Needs to be low-profile, available in EU, and quiet enough for office use.",
    topSubmission: {
      text: "Keychron K3 Pro - Brown switches. Compact, quiet, and ships to EU.",
      score: "+12",
      store: "Amazon",
      price: "$109",
    },
  },
};

export default async function LandingPage() {
  // Try to fetch content from Strapi, fallback to default
  let content = defaultContent;
  try {
    const cmsContent = await getLandingPageContent();
    if (cmsContent?.attributes) {
      const attrs = cmsContent.attributes;
      content = {
        heroBadge: attrs.heroBadge || defaultContent.heroBadge,
        heroTitle: attrs.heroTitle || defaultContent.heroTitle,
        heroDescription:
          attrs.heroDescription || defaultContent.heroDescription,
        ctaPrimaryText: attrs.ctaPrimaryText || defaultContent.ctaPrimaryText,
        ctaPrimaryLink: attrs.ctaPrimaryLink || defaultContent.ctaPrimaryLink,
        ctaSecondaryText:
          attrs.ctaSecondaryText || defaultContent.ctaSecondaryText,
        ctaSecondaryLink:
          attrs.ctaSecondaryLink || defaultContent.ctaSecondaryLink,
        features:
          attrs.features && attrs.features.length > 0
            ? attrs.features.map((f: any) => ({
                id: f.id || Math.random(),
                title: f.title || "",
                description: f.description || "",
              }))
            : defaultContent.features,
        sampleRequest: attrs.sampleRequest
          ? {
              id: attrs.sampleRequest.id || 1,
              title: attrs.sampleRequest.title || defaultContent.sampleRequest.title,
              description:
                attrs.sampleRequest.description ||
                defaultContent.sampleRequest.description,
              topSubmission: {
                text:
                  attrs.sampleRequest.topSubmission?.text ||
                  defaultContent.sampleRequest.topSubmission.text,
                score:
                  attrs.sampleRequest.topSubmission?.score ||
                  defaultContent.sampleRequest.topSubmission.score,
                store:
                  attrs.sampleRequest.topSubmission?.store ||
                  defaultContent.sampleRequest.topSubmission.store,
                price:
                  attrs.sampleRequest.topSubmission?.price ||
                  defaultContent.sampleRequest.topSubmission.price,
              },
            }
          : defaultContent.sampleRequest,
      };
    }
  } catch (error) {
    // Silently fallback to default content if Strapi is not configured
    console.warn("Could not fetch content from Strapi, using default content:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="muted" className="w-fit">
              {content.heroBadge}
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              {content.heroTitle}
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              {content.heroDescription}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="accent" size="lg">
                <Link href={content.ctaPrimaryLink}>{content.ctaPrimaryText}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={content.ctaSecondaryLink}>
                  {content.ctaSecondaryText}
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              {content.features.map((feature) => (
                <div key={feature.id}>
                  <span className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </span>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="border-border bg-white/80 shadow-lg">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  Sample request
                </p>
                <h2 className="text-2xl font-semibold">
                  {content.sampleRequest.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {content.sampleRequest.description}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">
                  Top submission
                </p>
                <p className="text-sm text-muted-foreground">
                  &quot;{content.sampleRequest.topSubmission.text}&quot;
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Score {content.sampleRequest.topSubmission.score}</span>
                  <span>
                    {content.sampleRequest.topSubmission.store} ·{" "}
                    {content.sampleRequest.topSubmission.price}
                  </span>
                </div>
              </div>
              <Button asChild variant="accent" className="w-full">
                <Link href="/signup">Join Onseek</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t border-border bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Onseek © 2026</span>
          <div className="flex gap-4">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

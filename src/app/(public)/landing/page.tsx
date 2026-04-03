import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLandingPageContent } from "@/lib/strapi/content";
import { PromotionalSidebar } from "@/components/requests/promotional-sidebar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

// Default fallback content
const defaultContent = {
  heroBadge: "Community-powered product hunting",
  heroTitle: "Request anything. Get the best buying links in minutes.",
  heroDescription:
    "Onseek is the fastest way to crowdsource purchase links. Post a request, receive vetted submissions, and pick the winning find.",
  ctaPrimaryText: "Start a request",
  ctaPrimaryLink: "/signup",
  ctaSecondaryText: "Explore live requests",
  ctaSecondaryLink: "/",
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
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

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
        <div className={cn(
          "grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start",
          user && "lg:grid-cols-1"
        )}>
          {!user && (
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
          )}
          {!user && <PromotionalSidebar />}
          
          {user && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <h1 className="text-3xl font-semibold">Welcome back to Onseek</h1>
              <p className="text-muted-foreground max-w-md">
                Explore the latest requests and submissions from the community.
              </p>
              <Button asChild variant="accent" size="lg">
                <Link href="/">Go to Dashboard</Link>
              </Button>
            </div>
          )}
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

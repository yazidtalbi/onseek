import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="muted" className="w-fit">
              Community-powered product hunting
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Request anything. Get the best buying links in minutes.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Onseek is the fastest way to crowdsource purchase links. Post a
              request, receive vetted submissions, and pick the winning find.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="accent" size="lg">
                <Link href="/signup">Start a request</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/app">Explore live requests</Link>
              </Button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div>
                <span className="text-lg font-semibold text-foreground">
                  Post
                </span>
                <p>Describe what you need and your budget.</p>
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">
                  Get links
                </span>
                <p>Hunters submit verified links with notes.</p>
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">
                  Choose
                </span>
                <p>Pick a winner and boost their reputation.</p>
              </div>
            </div>
          </div>
          <Card className="border-border bg-white/80 shadow-lg">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  Sample request
                </p>
                <h2 className="text-2xl font-semibold">
                  Find a quiet mechanical keyboard under $120
                </h2>
                <p className="text-sm text-muted-foreground">
                  Needs to be low-profile, available in EU, and quiet enough
                  for office use.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">
                  Top submission
                </p>
                <p className="text-sm text-muted-foreground">
                  &quot;Keychron K3 Pro - Brown switches. Compact, quiet, and ships
                  to EU.&quot;
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Score +12</span>
                  <span>Amazon · $109</span>
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


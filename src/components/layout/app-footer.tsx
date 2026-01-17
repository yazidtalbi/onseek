import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
        {/* About Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Onseek</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              On Onseek, there&apos;s always someone to help you find what you need. 
              Join our community to share requests and discover the best purchase links.
            </p>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide">Company</h4>
            <nav className="space-y-2">
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/app/settings" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </Link>
            </nav>
          </div>

          {/* Community Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide">Community</h4>
            <nav className="space-y-2">
              <Link href="/app" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Requests
              </Link>
              <Link href="/app/requests" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Requests
              </Link>
              <Link href="/app/submissions" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Submissions
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide">Resources</h4>
            <nav className="space-y-2">
              <Link href="/app/leaderboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
              <Link href="/app/new" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Create Request
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                © 2024-2026 Onseek. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground">
                Your data is secure. We use SSL encryption and comply with GDPR.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground max-w-2xl leading-relaxed">
            When you click on a link or make a purchase, we may receive a commission, 
            without compromising the neutrality of the site. Only the Onseek community 
            can determine the value of requests and submissions. We ensure this power 
            remains in your hands.
          </p>
        </div>
      </div>
    </footer>
  );
}


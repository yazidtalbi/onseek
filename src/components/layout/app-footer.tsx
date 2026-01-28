import Link from "next/link";
import { Facebook, Linkedin, Twitter, Youtube, Instagram } from "lucide-react";
import { MAIN_CATEGORIES } from "@/lib/categories";

export function AppFooter() {
  return (
    <footer className="border-t border-[#e5e7eb] mt-12 ">
      <div className="w-full px-4 pt-12 pb-6 md:px-8">
        {/* Links Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-8">
          {/* Column 1: App Pages */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">App</h4>
            <nav className="space-y-2">
              <Link href="/app" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/app/new" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Create a Request
              </Link>
              <Link href="/app/requests" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                My Requests
              </Link>
              <Link href="/app/submissions" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Proposals
              </Link>
              <Link href="/app/personal-items" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Inventory
              </Link>
              <Link href="/app/saved" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Saved
              </Link>
              <Link href="/app/notifications" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Notifications
              </Link>
              <Link href="/app/leaderboard" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Leaderboard
              </Link>
            </nav>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Categories</h4>
            <nav className="space-y-2">
              {MAIN_CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={`/app/category/${category.toLowerCase()}`}
                  className="block text-sm text-gray-600 hover:text-foreground transition-colors"
                >
                  {category}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: About & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">About & Support</h4>
            <nav className="space-y-2">
              <Link href="/about" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/help" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Help & Support
              </Link>
              <Link href="/feedback" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Feedback
              </Link>
              <Link href="/trust" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Trust, Safety & Security
              </Link>
              <Link href="/foundation" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Onseek Foundation
              </Link>
            </nav>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <nav className="space-y-2">
              <Link href="/terms" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
              <Link href="/privacy/california" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                CA Notice at Collection
              </Link>
              <Link href="/privacy/choices" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Your Privacy Choices
              </Link>
              <Link href="/accessibility" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Accessibility
              </Link>
            </nav>
          </div>

          {/* Column 5: Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <nav className="space-y-2">
              <Link href="/desktop" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Desktop App
              </Link>
              <Link href="/enterprise" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Enterprise Solutions
              </Link>
              <Link href="/release-notes" className="block text-sm text-gray-600 hover:text-foreground transition-colors">
                Release Notes
              </Link>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e5e7eb] my-8"></div>

        {/* Social Media and Mobile App */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          {/* Follow Us */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">Follow Us</span>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-foreground transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Mobile App */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-foreground">Mobile app</span>
            <div className="flex items-center gap-3">
              <a href="#" className="text-gray-600 hover:text-foreground transition-colors">
                <span className="text-2xl">🍎</span>
              </a>
              <a href="#" className="text-gray-600 hover:text-foreground transition-colors">
                <span className="text-2xl">🤖</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            © 2024 - 2026 <span className="text-black">onseek</span>® Global LLC
          </p>
        </div>
      </div>
    </footer>
  );
}

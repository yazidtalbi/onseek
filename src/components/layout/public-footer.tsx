"use client";

import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Hunters", href: "#" },
      { label: "Beta Program", href: "#" },
    ]
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/help" },
      { label: "Community", href: "#" },
      { label: "Feedback", href: "/feedback" },
      { label: "Status", href: "#" },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Contact", href: "#" },
    ]
  }
];

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-24">
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link href="/" className="text-2xl font-bold tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>
              onseek
            </Link>
            <p className="text-gray-500 max-w-xs text-base leading-relaxed">
              The fastest way to crowdsource purchase links from an expert community. Request anything, find it instantly.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="text-gray-400 hover:text-[#7755FF] transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#7755FF] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[#7755FF] transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>

          {footerLinks.map((group, idx) => (
            <div key={idx} className="space-y-6">
              <h4 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wider">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="text-gray-500 hover:text-[#7755FF] transition-colors text-base font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-400 text-sm">
            © 2026 Onseek. All rights reserved. Built for the modern hunter.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#1A1A1A] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-[#1A1A1A] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-sm text-gray-400 hover:text-[#1A1A1A] transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

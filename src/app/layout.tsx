import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/layout/auth-provider";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OnboardingModal } from "@/components/auth/onboarding-modal";

const interDisplay = Inter({
  variable: "--font-inter-display",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"]
});

export const metadata: Metadata = {
  title: "Onseek — The #1 Reverse Marketplace",
  description: "Where what you want finds you. End the endless search by posting your request and letting the perfect item find you.",
  icons: {
    icon: [
      { url: "/favfav/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favfav/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favfav/favicon.ico",
    apple: "/favfav/apple-touch-icon.png",
  },
  manifest: "/favfav/site.webmanifest",
  openGraph: {
    title: "Onseek",
    description: "Where what you want finds you. End the endless search by posting your request and letting the perfect item find you.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Onseek logo against a modern, interconnected digital landscape." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Onseek",
    description: "Where what you want finds you. End the endless search by posting your request and letting the perfect item find you.",
    images: ["/og-image.jpg"],
  },
};

import { Analytics } from "@vercel/analytics/react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const serializedUser = user ? {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata,
    aud: user.aud,
    created_at: user.created_at,
  } : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interDisplay.variable} ${geistMono.variable} ${instrumentSerif.variable} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider user={serializedUser} profile={profile}>
          <Providers>
            {children}
            <OnboardingModal />
          </Providers>
        </AuthProvider>
        <Toaster />
        <Analytics />
        <Script 
          src="https://t.contentsquare.net/uxa/82b383ca1f434.js" 
          strategy="lazyOnload" 
        />
      </body>
    </html>
  );
}

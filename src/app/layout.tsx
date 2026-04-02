import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Onseek",
  description:
    "Request items and get community purchase links fast, clean, and mobile-first.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

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
    <html lang="en">
      <body
        className={`${interDisplay.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <AuthProvider user={serializedUser} profile={profile}>
          <Providers>
            {children}
            <OnboardingModal />
          </Providers>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

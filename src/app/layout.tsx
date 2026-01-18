import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const interDisplay = Inter({
  variable: "--font-inter-display",
  subsets: ["latin"],
  display: "swap",
  // Use Inter Display variant by adjusting optical sizing
  // Inter Display is optimized for larger sizes (36px+)
  // We'll use CSS to load the actual Inter Display font
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interDisplay.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/app-navbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Verified, Lock, Headset, ArrowRight, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { RequestSlider } from "@/components/requests/request-slider";

interface PageProps {
  params: Promise<{ item: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { item } = await params;
  const decodedItem = decodeURIComponent(item).replace(/-/g, " ");
  const capitalizedItem = decodedItem.charAt(0).toUpperCase() + decodedItem.slice(1);

  return {
    title: `Looking for ${capitalizedItem}? | Onseek`,
    description: `Don't spend hours searching for ${capitalizedItem}. Post a Request on Onseek and let verified providers send you Proposals directly.`,
    openGraph: {
      title: `Looking for ${capitalizedItem}? | Onseek`,
      description: `Post a Request for ${capitalizedItem} and get matched with verified providers.`,
    },
  };
}

export default async function LookingForItemPage({ params }: PageProps) {
  const { item } = await params;
  const decodedItem = decodeURIComponent(item).replace(/-/g, " ");
  const capitalizedItem = decodedItem.split(' ').map(word =>
    word.toLowerCase() === 'iphone' ? 'iPhone' : word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const supabase = await createServerSupabaseClient();

  const { data: recentRequests } = await supabase
    .from("requests")
    .select("*, profiles(display_name, avatar_url)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#7755FF]/20">
      <AppNavbar hideSearch={true} minimal={true} ctaText="Start now" />

      <main>
        {/* Intent Hero */}
        <section className="pt-16 pb-24 px-6 max-w-7xl mx-auto border-b border-gray-100">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 text-left">
              <div className="inline-block px-4 py-1.5 bg-[#F5F3FF] text-[#7755FF] rounded-full text-[13px] font-bold tracking-tight mb-8">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Your Item On Demand
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-[84px] font-extrabold tracking-[-0.04em] leading-[0.95] mb-8 text-[#1A1A1A] max-w-2xl" style={{ fontFamily: 'var(--font-expanded)' }}>
                Looking for <br />
                <span className="text-[#7755FF]">{capitalizedItem}?</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 max-w-lg mb-10 font-medium tracking-tight leading-relaxed">
                Flip the script on traditional shopping. Post a Request, set your budget, and let verified sellers compete for you.
              </p>

              <div className="flex flex-col items-start gap-10">
                <div className="relative inline-flex items-center group">
                  <Button asChild className="bg-[#7755FF] hover:bg-[#6644EE] text-white px-10 py-8 text-base rounded-full font-bold transition-all hover:scale-105 active:scale-95 tracking-tight shadow-none border-0 uppercase">
                    <Link href="/signup" className="flex items-center gap-2">
                      Post a Request Now
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>

                  {/* CTA Doodle (Sparkle highlight) */}
                  <div className="absolute -right-10 top-0 hidden md:block select-none pointer-events-none transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-[#1A1A1A] scale-x-[-1]">
                      <path d="M10 15L2 12" />
                      <path d="M8 20H0" />
                      <path d="M10 25L2 28" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {[
                      "https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
                    ].map((src, i) => (
                      <div key={i} className="w-14 h-14 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-none transition-transform hover:scale-110">
                        <img
                          src={src}
                          alt="Community Member"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>64,739</span>
                    <span className="text-sm md:text-base font-medium text-gray-500">Happy seekers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-2xl lg:max-w-none">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/6697318/pexels-photo-6697318.jpeg"
                  alt="Marketplace Collaboration"
                  className="w-full h-[500px] md:h-[650px] object-cover rounded-[48px] shadow-none border border-gray-100"
                />

                {/* Visual Labels from reference */}
                <div className="absolute top-12 -left-12 bg-[#1A1A1A]/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl transition-transform hover:scale-105 cursor-default z-10">
                  Let your item come to you
                </div>

                <div className="absolute bottom-16 -right-8 bg-[#1A1A1A]/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl transition-transform hover:scale-105 cursor-default z-10">
                  Receive proposals directly from sellers
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Redesigned Why Onseek? Section (Mailchimp Style) */}
        <section className="py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-[40px] md:text-[56px] leading-[1.05] mb-6 text-[#1A1A1A] font-extrabold tracking-[-0.03em]" style={{ fontFamily: 'var(--font-expanded)' }}>
              Why Onseek?
            </h2>
            <p className="text-xl text-gray-400 font-medium max-w-3xl mx-auto mb-20 leading-relaxed">
              We're built for people who value their time. Post a Request, set your budget, <br className="hidden md:block" />
              and we'll help you find exactly what you're looking for by bringing the market to you.
            </p>

            <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
              <div className="flex flex-col items-center group">
                <div className="w-56 h-56 mb-8 overflow-hidden rounded-3xl transition-transform duration-500">
                  <img src="/illustrations/onseek_magnet.png" alt="Sellers Compete" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Sellers compete for you</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Instead of hunting for prices, you set your own budget and let verified sellers send you their best offers directly.
                </p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-56 h-56 mb-8 overflow-hidden rounded-3xl transition-transform duration-500">
                  <img src="/illustrations/onseek_flower.png" alt="Protect your peace" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Protect your peace</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Your time is valuable. Our request-first model eliminates the friction of traditional marketplaces, letting you focus on what matters.
                </p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-56 h-56 mb-8 overflow-hidden rounded-3xl transition-transform duration-500">
                  <img src="/illustrations/onseek_city.png" alt="Verified Marketplace" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Verified marketplace</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Every provider on Onseek is manually vetted to ensure quality, reliability, and a completely secure transaction experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-6 bg-[#f5f4f6] overflow-hidden relative">
          {/* Background Text Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-bold text-gray-50 opacity-[0.03] select-none pointer-events-none whitespace-nowrap">
            How it works
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-24">
              <p className="text-[#7755FF] font-bold tracking-widest text-[11px] mb-4">The Process</p>
              <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] mb-6 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>How it works</h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                The most intuitive approach designed to find exactly what you want, when you want it.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#7755FF] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-none">
                    1
                  </div>
                  <div className="bg-[#FAFAFA] border border-gray-100 p-10 rounded-[40px]">
                    <div className="space-y-4">
                      <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-100 rounded-full"></div>
                      <div className="h-4 w-2/3 bg-gray-100 rounded-full"></div>
                      <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="h-12 bg-white rounded-2xl border border-gray-100"></div>
                        <div className="h-12 bg-white rounded-2xl border border-gray-100"></div>
                      </div>
                      <div className="h-12 bg-[#7755FF]/10 rounded-2xl border border-[#7755FF]/20 mt-4"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-4xl font-bold mb-6 tracking-tight">Define Your Request</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                  Clearly outline exactly what you are looking for. Include specific details like the item name, your maximum budget, and any quality requirements or conditions you have.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm font-bold text-[#7755FF]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7755FF]"></div>
                    Set your own budget
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-[#7755FF]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7755FF]"></div>
                    Specify condition & details
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                <h3 className="text-4xl font-bold mb-6 tracking-tight">Receive Tailored Offers</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                  Sit back as verified providers review your request. You'll receive tailored proposals directly from vetted sellers who can meet your specific needs and budget.
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 rounded-full border border-gray-100 text-[10px] font-bold tracking-widest text-gray-400">Verified Providers only</div>
                  <div className="px-4 py-2 rounded-full border border-gray-100 text-[10px] font-bold tracking-widest text-gray-400">Zero spam</div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#7755FF] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-none">
                  2
                </div>
                <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-none">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#F5F3FF] rounded-2xl border border-[#7755FF]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#7755FF]/20"></div>
                        <div className="space-y-1">
                          <div className="h-3 w-24 bg-[#7755FF]/30 rounded-full"></div>
                          <div className="h-2 w-16 bg-[#7755FF]/20 rounded-full"></div>
                        </div>
                      </div>
                      <div className="h-4 w-12 bg-[#7755FF]/30 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="space-y-1">
                          <div className="h-3 w-24 bg-gray-300 rounded-full"></div>
                          <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                      <div className="h-4 w-12 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-32 text-center">
              <Button asChild className="bg-[#7755FF] hover:bg-[#6644EE] text-white px-8 py-6 text-sm rounded-full font-bold shadow-none transition-all tracking-tight border-0 tracking-tight">
                <Link href="/signup">Start Your Request</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Happy Seekers */}
        <section className="py-24 px-6 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#7755FF] font-bold tracking-widest text-[11px] mb-4">Reviews</p>
              <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>Happy seekers</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-none hover:border-[#7755FF]/20 transition-all">
                <div className="text-[#7755FF] mb-6">{"★".repeat(5)}</div>
                <p className="text-lg text-[#1A1A1A] font-medium leading-relaxed italic mb-8">
                  "I was looking for a very specific Leica lens for months. Within 48 hours of posting on Onseek, I had three verified offers. The transaction was seamless."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marc" alt="Marc" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Marc L.</p>
                    <p className="text-xs text-gray-400 font-medium">Verified Seeker</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-none hover:border-[#7755FF]/20 transition-all">
                <div className="text-[#7755FF] mb-6">{"★".repeat(5)}</div>
                <p className="text-lg text-[#1A1A1A] font-medium leading-relaxed italic mb-8">
                  "Found a rare vintage Carhartt jacket in perfect condition. The escrow service gave me peace of mind that I wouldn't get scammed. Highly recommended!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Sarah C.</p>
                    <p className="text-xs text-gray-400 font-medium">Verified Seeker</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Requests Feed */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F3FF] text-[#7755FF] rounded-full text-[10px] font-bold tracking-widest mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7755FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7755FF]"></span>
              </span>
              Live Activity Feed
            </div>
            <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Recent requests</h2>
          </div>

          <RequestSlider requests={recentRequests || []} />
        </section>

        {/* Common Questions */}
        <section className="py-24 px-6 bg-[#FAFAFA]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#7755FF] font-bold tracking-widest text-[11px] mb-4">Support</p>
              <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>Frequently asked<br />questions</h2>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl font-medium hover:no-underline py-6">What is Onseek?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  Onseek is a reverse marketplace where buyers state exactly what they need, and sellers compete to offer the best matches. It cuts through the noise of traditional searching.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6">How do I become a seller?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  For the moment, every user can submit proposals from their inventory. Official shops are currently in our roadmap.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6">Is it free?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  Yes, it is completely free to post requests and submit offers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#7755FF] p-16 md:p-24 rounded-[32px] text-center relative overflow-hidden group shadow-none">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7755FF] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7755FF] opacity-10 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>

              <div className="relative z-10 text-white">
                <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] mb-6">Start your search today</h2>
                <p className="text-xl opacity-80 font-medium max-w-xl mx-auto mb-12">
                  Stop scrolling endlessly. Let the market find exactly what you're looking for.
                </p>
                <Button asChild className="bg-white hover:bg-gray-50 text-[#7755FF] px-10 py-8 text-sm rounded-full font-bold shadow-none transition-all hover:scale-105 tracking-tight border-0">
                  <Link href="/signup">Post a Request Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Utility Footer */}
        <footer className="bg-white pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
              <div>
                <h4 className="font-bold text-xs mb-6 tracking-widest text-gray-300">Popular Requests</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">iPhone 16 Pro Max</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">MacBook Pro M3</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Gaming Consoles</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Camera Gear</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xs mb-6 tracking-widest text-gray-300">Recently Fulfilled</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Vintage Collectibles</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Luxury Watches</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Designer Items</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Home Tech</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xs mb-6 tracking-widest text-gray-300">Regional Boards</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Requests in Casablanca</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Rabat Marketplace</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Marrakech Deals</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Tanger Network</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xs mb-6 tracking-widest text-gray-300">Buyers for {capitalizedItem}</h4>
                <ul className="space-y-4">
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Urgent Buy Requests</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Bulk Orders</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Enterprise Needs</Link></li>
                  <li><Link href="#" className="text-sm font-bold text-gray-400 hover:text-[#7755FF] transition-colors">Verified Leads</Link></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center pt-12 gap-8">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>onseek</Link>
                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                <p className="text-[10px] font-bold tracking-widest text-gray-300">Request-First Marketplace</p>
              </div>
              <div className="flex gap-8 text-[11px] font-bold tracking-widest text-gray-400">
                <Link href="/terms" className="hover:text-[#1A1A1A]">Terms</Link>
                <Link href="/privacy" className="hover:text-[#1A1A1A]">Privacy</Link>
                <Link href="/legal" className="hover:text-[#1A1A1A]">Legal</Link>
                <span className="text-gray-100">© 2026</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

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
import { Verified, Lock, Headset, ArrowRight, ChevronLeft, ChevronRight, Target, Check } from "lucide-react";
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
        <section className="min-h-[calc(100vh-72px)] flex items-center py-20 px-6 max-w-7xl mx-auto border-b border-gray-100">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 w-full">
            <div className="flex-1 text-left">
              <div className="inline-block px-4 py-1.5 bg-[#F5F3FF] text-[#7755FF] rounded-full text-[13px] font-bold tracking-tight mb-8">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Your Item On Demand
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-[-0.04em] leading-[0.95] mb-8 text-[#1A1A1A] max-w-2xl" style={{ fontFamily: 'var(--font-expanded)' }}>
                Looking for <br />
                <span className="text-[#7755FF]">{capitalizedItem}?</span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 max-w-lg mb-10 font-medium tracking-tight leading-relaxed">
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

        {/* Redesigned What is Onseek? Section (Mailchimp Style) */}
        <section className="py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-[40px] md:text-[56px] leading-[1.05] mb-6 text-[#1A1A1A] font-extrabold tracking-[-0.03em]" style={{ fontFamily: 'var(--font-expanded)' }}>
              What is Onseek?
            </h2>
            <p className="text-xl text-gray-400 font-medium max-w-3xl mx-auto mb-20 leading-relaxed">
              We're built for people who value their time. Post a Request, set your budget, <br className="hidden md:block" />
              and we'll help you find exactly what you're looking for by bringing the market to you.
            </p>

            <div className="grid md:grid-cols-3 gap-16 lg:gap-24">
              <div className="flex flex-col items-center group">
                <div className="w-44 h-44 mb-8 overflow-hidden rounded-3xl transition-transform duration-500">
                  <img src="/illustrations/onseek_magnet_purple.png" alt="Sellers Compete" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Sellers compete for you</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Instead of hunting for prices, you set your own budget and let verified sellers send you their best offers directly.
                </p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-44 h-44 mb-8 overflow-hidden rounded-3xl transition-transform duration-500">
                  <img src="/illustrations/onseek_flower_purple.png" alt="Protect your peace" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Protect your peace</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Your time is valuable. Our request-first model eliminates the friction of traditional marketplaces, letting you focus on what matters.
                </p>
              </div>

              <div className="flex flex-col items-center group">
                <div className="w-44 h-44 mb-8 overflow-hidden rounded-3xl transition-transform duration-500">
                  <img src="/illustrations/onseek_city_purple.png" alt="Verified Marketplace" className="w-full h-full object-contain" />
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
        <section className="py-24 px-6 bg-white overflow-hidden relative">
          {/* Background Text Accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-bold text-gray-50 opacity-[0.03] select-none pointer-events-none whitespace-nowrap">
            How it works
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-24">
              <p className="text-[#7755FF] font-bold text-[11px] mb-4">The Process</p>
              <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] mb-6 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>How it works</h2>
              <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                The most intuitive approach designed to find exactly what you want, when you want it.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="absolute -top-8 left-0 z-30 w-12 h-12 bg-[#FF8A00] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-white">
                    1
                  </div>
                  <div className="bg-gray-100/50 border border-gray-100 p-6 md:p-8 rounded-[40px] relative overflow-hidden group">
                    <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-none relative z-10 overflow-hidden">
                      <h4 className="text-2xl font-bold text-[#1A1A1A] text-center mb-8" style={{ fontFamily: 'var(--font-expanded)' }}>What are you looking for?</h4>

                      <div className="relative mb-6">
                        <input
                          type="text"
                          readOnly
                          value="Mercedes C220"
                          className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-base font-medium text-[#1A1A1A] outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </div>
                      </div>

                      <div className="mb-10">
                        <p className="text-sm font-medium text-gray-400 mb-4">Which category fits best your item?</p>
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1A1A1A] text-white border-transparent text-[11px] font-bold ring-1 ring-[#1A1A1A] shadow-sm">
                            <Check className="w-4 h-4 text-green-500" strokeWidth={4} />
                            Automotive
                          </div>
                          <div className="h-9 w-28 bg-gray-100/80 rounded-full animate-pulse"></div>
                          <div className="h-9 w-24 bg-gray-100/80 rounded-full animate-pulse delay-75"></div>
                          <div className="h-9 w-32 bg-gray-100/80 rounded-full animate-pulse delay-100"></div>
                          <div className="h-9 w-20 bg-gray-100/80 rounded-full animate-pulse delay-150"></div>
                          <div className="h-9 w-26 bg-gray-100/80 rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="px-8 py-3 bg-gray-50 text-gray-300 rounded-full text-sm font-bold cursor-not-allowed">
                          Next: Budget
                        </div>
                      </div>
                    </div>

                    {/* Background decorative blobs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7755FF] opacity-[0.03] blur-[80px] rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-4xl font-normal mb-6 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Describe It</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                  Clearly outline exactly what you are looking for. Include specific details like the item name, your maximum budget, and any quality requirements or conditions you have.
                </p>
                <div className="space-y-8 mt-10 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-200">
                  <div className="relative pl-8 group">
                    <div className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full bg-[#7755FF] border-[2px] border-white ring-1 ring-gray-100"></div>
                    <p className="text-lg md:text-xl font-medium text-[#1A1A1A] tracking-tight">Set your item name & type</p>
                  </div>
                  <div className="relative pl-8 group">
                    <div className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full bg-[#7755FF] border-[2px] border-white ring-1 ring-gray-100"></div>
                    <p className="text-lg md:text-xl font-medium text-[#1A1A1A] tracking-tight">Set your own budget & condition</p>
                  </div>
                  <div className="relative pl-8 group">
                    <div className="absolute left-0 top-2 w-3.5 h-3.5 rounded-full bg-[#7755FF] border-[2px] border-white ring-1 ring-gray-100"></div>
                    <p className="text-lg md:text-xl font-medium text-[#1A1A1A] tracking-tight">Specify preferences & dealbreakers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                <h3 className="text-4xl font-normal mb-6 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Get Matched</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                  Sit back as verified providers review your request. You'll receive tailored proposals directly from vetted sellers who can meet your specific needs and budget.
                </p>
                <div className="flex flex-col gap-8 mt-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 rounded-full p-1.5 shrink-0">
                      <Check className="h-4 w-4 text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-medium text-[#1A1A1A] leading-snug tracking-tight">Direct Messaging</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 rounded-full p-1.5 shrink-0">
                      <Check className="h-4 w-4 text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-medium text-[#1A1A1A] leading-snug tracking-tight">Instant Comparisons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-green-500 rounded-full p-1.5 shrink-0">
                      <Check className="h-4 w-4 text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-medium text-[#1A1A1A] leading-snug tracking-tight">Spam-Free Zone</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col justify-center">
                {/* Burst Decoration */}
                <div className="absolute -top-12 -left-12 z-20 w-32 h-32 opacity-90 pointer-events-none transform -rotate-12">
                  <img src="/illustrations/burst_decoration.png" alt="Burst" className="w-full h-full object-contain" />
                </div>

                <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#FF8A00] text-white rounded-full flex items-center justify-center text-xl font-bold shadow-none">
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
              <Button asChild className="bg-[#232833] hover:bg-[#232833]/90 text-white px-12 py-9 text-lg rounded-full font-medium shadow-none transition-all hover:scale-105 active:scale-95 border-0">
                <Link href="/signup">Create your request now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Happy Seekers Masonry */}
        <section className="py-20 px-6 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[#7755FF] font-bold text-[13px] mb-4 tracking-tight">Success Stories</p>
              <h2 className="text-[40px] md:text-[64px] leading-[1] font-medium tracking-[-0.03em] mb-4 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Happy seekers</h2>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {[
                {
                  stat: "14+ requests",
                  label: "Fulfilled on Onseek",
                  quote: "Onseek not only helps us find those unique items with specialized sellers—it handles the entire search for us. Truly a game-changer for our gear sourcing.",
                  user: "Max Lind",
                  activity: "Bought a Sony A7 IV",
                  gradient: "from-[#2D3139] to-[#1A1A1A]",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
                },
                {
                  stat: "200+ payments",
                  label: "Processed on Onseek",
                  quote: "As our needs evolve, Onseek enables us to find sellers who are able to reach our product goals faster than any other marketplace we've tried. The reverse bidding works like magic for sourcing rare fashion pieces.",
                  user: "Carla Giordano",
                  activity: "Found limited edition sneakers",
                  gradient: "from-[#4A3AFF] to-[#9D4EDD]",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
                },
                {
                  stat: "70+ categories",
                  label: "Managed on Onseek",
                  quote: "The continual support and product evolution has been impressive. We've found everything from rare watches to specialized hardware with zero friction. It's the standard for serious buyers.",
                  user: "Peter Kang",
                  activity: "Sold a Custom PC Build",
                  gradient: "from-[#E0F23C] to-[#C9E015]",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
                  darkText: true
                },
                {
                  stat: "20+ items",
                  label: "Secured globally",
                  quote: "Finding rare gear used to be a full-time job. Now I just post a request and let the best sellers in the world find me. It's the most efficient way to buy.",
                  user: "Cory Shoaf",
                  activity: "Secured a Vintage Leica M6",
                  gradient: "from-[#6B4EE0] to-[#E6B3FF]",
                  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
                },
                {
                  stat: "+$20K saved",
                  label: "By negotiating on Onseek",
                  quote: "The technical gear we've sourced here has been flawless. The escrow system gives me total peace of mind for high-value transactions.",
                  user: "Vivek Ramakrishnan",
                  activity: "Found a high-end studio mic",
                  gradient: "from-[#FF8A00] to-[#FFB800]",
                  avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop",
                  darkText: true
                },
                {
                  stat: "+$45K spent",
                  label: "On recent requests",
                  quote: "I tried every other platform. Marketplaces, forums, groups... nothing compares to the standards and response times of Onseek.",
                  user: "Quintin Au",
                  activity: "Sold an Xbox Series S",
                  gradient: "from-[#232833] to-[#1A1A1A]",
                  avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&h=200&auto=format&fit=crop"
                }
              ].map((item, i) => (
                <div key={i} className="break-inside-avoid relative group">
                  <div className={`rounded-[24px] overflow-hidden bg-gradient-to-br ${item.gradient} p-[4px] transition-all h-full`}>
                    <div className="flex flex-col h-full">
                      {/* Gradient Header Section */}
                      <div className="px-8 py-6 flex flex-col items-center text-center">
                        <span className={`text-3xl font-medium tracking-tight ${item.darkText ? 'text-black' : 'text-white'}`} style={{ fontFamily: 'var(--font-expanded)' }}>{item.stat}</span>
                        <span className={`text-[12px] font-bold mt-2 ${item.darkText ? 'text-black/60' : 'text-white/60'}`}>{item.label}</span>
                      </div>

                      {/* White Body Section */}
                      <div className="bg-white rounded-[20px] p-6 md:p-8 -mt-2 relative z-10 flex flex-col justify-between flex-grow gap-8">
                        <div className="flex flex-col gap-6">
                          <div className="px-4 py-1.5 rounded-full border border-gray-100 w-fit text-xs font-bold text-gray-400">
                            {item.activity}
                          </div>
                          <p className="text-lg md:text-xl text-[#1A1A1A] font-medium leading-snug tracking-tight">
                            "{item.quote}"
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm shrink-0">
                            <img src={item.avatar} alt={item.user} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-medium text-base md:text-lg text-[#1A1A1A] tracking-tight">{item.user}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common Questions */}
        <section className="py-24 px-6 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#7755FF] font-bold text-[11px] mb-4">Support</p>
              <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>Frequently asked<br />questions</h2>
            </div>

            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6" style={{ fontFamily: 'var(--font-expanded)' }}>What is Onseek?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  Onseek is a reverse marketplace where buyers state exactly what they need, and sellers compete to offer the best matches. It cuts through the noise of traditional searching.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6" style={{ fontFamily: 'var(--font-expanded)' }}>How do I become a seller?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  For the moment, every user can submit proposals from their inventory. Official shops are currently in our roadmap.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6" style={{ fontFamily: 'var(--font-expanded)' }}>Is it free?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  Yes, it is completely free to post requests and submit offers. No hidden fees or commissions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6" style={{ fontFamily: 'var(--font-expanded)' }}>How long does it take?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  Most requests receive their first offers within 24 hours. The average time to find a perfect match and close a deal is 3-5 days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6" style={{ fontFamily: 'var(--font-expanded)' }}>Can I cancel my request?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  Yes, you can close your request at any time. If you found the item elsewhere or changed your mind, simply mark it as closed from your dashboard.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-xl font-medium hover:no-underline text-left py-6" style={{ fontFamily: 'var(--font-expanded)' }}>How do payments work?</AccordionTrigger>
                <AccordionContent className="text-gray-500 font-medium text-base">
                  For your safety, we recommend using our integrated escrow payment system which holds funds securely until you verify the item's condition upon delivery.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Categories Carousel (Hidden for the moment) */}
        {/* 
        <section className="py-24 overflow-hidden border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-extrabold tracking-[-0.03em]" style={{ fontFamily: 'var(--font-expanded)' }}>
              Find exactly <br /> what you need.
            </h2>
          </div>
          
          <div className="pause-on-hover relative">
            <div className="flex animate-marquee gap-6 w-max px-6">
              {[
                { title: "Tech &\nElectronics", bg: "bg-[#451026]" },
                { title: "Automotive", bg: "bg-[#FF5A5F]" },
                { title: "Fashion &\nAccessories", bg: "bg-[#6B4EE0]" },
                { title: "Gaming &\nConsoles", bg: "bg-[#E6FF5F]" },
                { title: "Sports &\nOutdoors", bg: "bg-[#D1EBEB]" },
                { title: "Home &\nLiving", bg: "bg-[#1A1A1A]" },
                { title: "Health &\nBeauty", bg: "bg-[#FF8A00]" },
                { title: "Grocery &\nFood", bg: "bg-[#451026]", id: 'dup1' },
                { title: "Family &\nKids", bg: "bg-[#FF5A5F]", id: 'dup2' },
                { title: "Garden &\nDIY", bg: "bg-[#6B4EE0]", id: 'dup3' },
                { title: "Services", bg: "bg-[#E6FF5F]", id: 'dup4' },
                { title: "Travel", bg: "bg-[#D1EBEB]", id: 'dup5' },
                { title: "Culture &\nEntertainment", bg: "bg-[#1A1A1A]", id: 'dup6' },
                { title: "Finance &\nInsurance", bg: "bg-[#FF8A00]", id: 'dup7' }
              ].map((cat, i) => (
                <div key={i} className={`w-[280px] h-[300px] rounded-[20px] p-6 flex flex-col justify-between transition-all shrink-0 ${cat.bg}`}>
                  <h3 className={`text-2xl font-medium leading-tight whitespace-pre-line ${cat.bg === 'bg-[#D1EBEB]' || cat.bg === 'bg-[#E6FF5F]' ? 'text-[#1A1A1A]' : 'text-white'}`} style={{ fontFamily: 'var(--font-expanded)' }}>
                    {cat.title}
                  </h3>
                  <div className="w-full aspect-[4/3] bg-black/10 rounded-2xl flex items-center justify-center overflow-hidden">
                    <div className="w-1/2 h-1/2 bg-white/20 blur-2xl rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        */}

        {/* Seek Faster CTA */}
        <section className="py-24 px-6 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-[1.3] order-2 md:order-1">
              <img
                src="/illustrations/onseek_man_requests.png"
                alt="Seek faster, find smarter"
                className="w-full max-w-7xl mx-auto drop-shadow-sm scale-110 origin-center"
              />
            </div>
            <div className="flex-1 order-1 md:order-2 text-left">
              <h2 className="text-[40px] md:text-[64px] leading-[1.05] font-extrabold tracking-[-0.03em] mb-8 text-[#222026]" style={{ fontFamily: 'var(--font-expanded)' }}>
                Seek faster. <br /> Find smarter.
              </h2>
              <p className="text-xl text-gray-500 font-medium mb-12 leading-relaxed max-w-xl">
                Skip the endless scrolling. Post your request, define your needs, and let the most qualified partners come to you. High-signal connections, zero noise.
              </p>
              <Button asChild className="bg-[#232833] hover:bg-[#232833]/90 text-white px-12 py-9 text-lg rounded-full font-medium shadow-none transition-all hover:scale-105 active:scale-95 border-0">
                <Link href="/signup">Post your request now</Link>
              </Button>
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

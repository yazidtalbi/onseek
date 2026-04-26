"use client";

import { useRef } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, Target, ShieldCheck, Search, ArrowUpRight, MessageSquare, Check, Vote } from "lucide-react";
import { InterceptBanner } from "@/components/requests/intercept-banner";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  const images = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1526170315870-efffd0ad46b4?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&h=360",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=360"
  ];

  // Manual snake wave: up, down, up, faar down... and so on
  const snakeOffsets = [-25, 15, -12, 45, 25, 5, -15, -8, 8, 30, 15, -5, -20, 0, 15];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <PublicNavbar disableHide />

      <main className="w-full">
        {/* Hero Section */}
        <section className="pt-20 bg-white">
          <div className="relative bg-[#6925dc] overflow-hidden px-6 py-24 md:px-24 md:py-32 h-[600px] flex flex-col items-center justify-center">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none z-0" />
            
            <div className="max-w-6xl mx-auto w-full relative z-10">
              <div className="max-w-2xl text-white space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-bold uppercase tracking-widest">
                  <Zap className="w-3.5 h-3.5 text-accent fill-accent" />
                  The #1 Reverse Marketplace
                </div>
                <h1 className="text-5xl md:text-[68px] font-bold tracking-tight leading-[1.0] text-white max-w-4xl" style={{ fontFamily: 'var(--font-expanded)' }}>
                  The e-commerce, <br /> flipped
                </h1>
                <p className="text-lg md:text-xl text-white max-w-xl font-medium leading-relaxed">
                  Onseek is the engine behind a new era of commerce; one where people lead and products follow. Forget the endless scroll of unwanted stock. We are the home for authentic human demand, bridging the gap between "I wish this existed" and "Here it is."
                </p>
              </div>
            </div>

            {/* Hero Asset */}
            <div className="relative md:absolute md:right-[5%] md:top-1/2 md:-translate-y-1/2 w-full md:w-[40%] h-[250px] md:h-full flex items-center justify-center z-10 mt-12 md:mt-0">
              <img
                src="/3D.png"
                alt="Onseek Target"
                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>
        </section>


        {/* How It Works */}
        <section className="py-32 px-6 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto">
            {/* Intro Row */}
            {/* Intro Row */}
            <div className="max-w-3xl mx-auto text-center mb-32 md:mb-48">
              <h2 className="text-[40px] md:text-[64px] leading-[1.1] font-bold tracking-[-0.03em] mb-8 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>How does Onseek work?</h2>
              <p className="text-xl text-[#1A1A1A] font-medium leading-relaxed mb-10">Every day, thousands of seekers and hunters around the world post, propose, and vote on high-intent requests organized around their unique interests.</p>
            </div>

            {/* Request Row */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32 mb-32 md:mb-48">
              <div className="flex-1 text-left order-2 md:order-1">
                <h3 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-8" style={{ fontFamily: 'var(--font-expanded)' }}>Request</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">The seeker can share what they are looking for by posting a detailed request, including budget, condition, and preferences.</p>
              </div>
              <div className="flex-1 w-full order-1 md:order-2">
                <div className="aspect-square w-full rounded-[48px] bg-[#FF4500] p-12 md:p-10 flex items-center justify-center overflow-hidden">
                  <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-none relative z-10 overflow-hidden w-full h-full flex flex-col justify-center">
                    <h4 className="text-2xl font-bold text-[#1A1A1A] text-center mb-8" style={{ fontFamily: 'var(--font-expanded)' }}>What are you looking for?</h4>
                    <div className="relative mb-6">
                      <input type="text" readOnly={true} className="w-full px-6 py-4 bg-white border border-gray-200 rounded-2xl text-base font-medium text-[#1A1A1A] outline-none" defaultValue="Mercedes C220" />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
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
                    <div className="absolute bottom-8 right-8 md:bottom-10 md:right-10">
                      <div className="px-8 py-3 bg-gray-50 text-gray-300 rounded-full text-sm font-bold cursor-not-allowed">Next: Budget</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Propose Row */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32 mb-32 md:mb-48">
              <div className="flex-1 w-full">
                <div className="aspect-square w-full rounded-[48px] bg-[#00D084] p-12 md:p-10 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-white rounded-[32px] shadow-2xl relative p-8">
                    <div className="h-full flex flex-col pt-12">
                      <img src="https://images.pexels.com/photos/36714304/pexels-photo-36714304.jpeg?_gl=1*1b9x8ir*_ga*MTU1OTc0ODczMC4xNzc1NzU1MjM1*_ga_8JE65Q40S6*czE3NzY3OTU1MDIkbzckZzEkdDE3NzY3OTU1OTQkajQxJGwwJGgw" alt="Proposal" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <div className="absolute top-10 left-10 right-10 bg-white border-2 border-gray-100 p-4 rounded-2xl shadow-xl transform -rotate-2">
                      <p className="text-sm font-bold text-[#1A1A1A]">"I have the exact vintage piece you're looking for, in mint condition!"</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-8" style={{ fontFamily: 'var(--font-expanded)' }}>Propose</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">Hunters reply to requests with tailored proposals. Proposals provide discussion, photos, and specific terms for the deal.</p>
              </div>
            </div>

            {/* Winner Row */}
            <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32">
              <div className="flex-1 text-left order-2 md:order-1">
                <h3 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-8" style={{ fontFamily: 'var(--font-expanded)' }}>Winner</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">The most rewarding moment on Onseek. When a proposal matches exactly what the seeker needs, they pick a winner. The deal is secured, the hunt is over, and both parties move forward with total clarity.</p>
              </div>
              <div className="flex-1 w-full order-1 md:order-2">
                <div className="aspect-square w-full rounded-[48px] bg-[#6925DC] p-12 md:p-10 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-white rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col p-8 items-center justify-center text-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                      <Check className="w-12 h-12 text-white" strokeWidth={4} />
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-expanded)' }}>Proposal Picked!</h4>
                      <p className="text-gray-500 font-medium">Successfully matched with a verified hunter</p>
                    </div>
                    <div className="px-6 py-3 rounded-full bg-emerald-50/50 text-emerald-600 text-sm font-bold border border-emerald-100">
                      Winner: @vintage_guru
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Animated Stack Section */}
        <AnimatedRequestStack />

        {/* Stats Section: By the Numbers */}
        <section className="py-32 px-6 bg-[#0B0B0B] text-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl md:text-[64px] font-bold tracking-tight mb-6" style={{ fontFamily: 'var(--font-expanded)' }}>Onseek by the numbers</h2>
              <p className="text-xl text-gray-400 max-w-2xl font-medium leading-relaxed">
                Onseek is a growing family of hunters and seekers from across the globe, collaborating to find the best items at the best prices.
              </p>
              <p className="text-xs text-gray-500 mt-6 font-bold uppercase tracking-widest">As of December 31, 2025</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {[
                { number: "1,196", label: "Active hunters" },
                { number: "800+", label: "Requests daily" },
                { number: "15+", label: "Main categories" },
                { number: "98%", label: "Satisfaction rate" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-[32px] p-10 flex flex-col justify-center min-h-[180px]">
                  <span className="text-[48px] font-bold text-[#6925DC] leading-none mb-2" style={{ fontFamily: 'var(--font-expanded)' }}>
                    {stat.number}
                  </span>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button asChild className="rounded-full bg-[#6925DC] hover:bg-[#581ec0] px-12 h-16 text-lg font-bold shadow-none border-0 transition-all">
                <Link href="/signup">Visit Onseek</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 bg-[#FAFAFA] border-y border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[#7755FF] font-bold text-[13px] mb-4 tracking-tight uppercase">Success Stories</p>
              <h2 className="text-[40px] md:text-[64px] leading-[1] font-bold tracking-[-0.03em] mb-4 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>Happy seekers</h2>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {[
                {
                  stat: "3 requests",
                  label: "Fulfilled on Onseek",
                  quote: "Onseek not only helps us find those unique items with specialized sellers—it handles the entire search for us. Truly a game-changer for our gear sourcing.",
                  user: "Max Lind",
                  activity: "Bought a Sony A7 IV",
                  gradient: "from-[#2D3139] to-[#1A1A1A]",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
                },
                {
                  stat: "12 deals",
                  label: "Secured on Onseek",
                  quote: "As our needs evolve, Onseek enables us to find sellers who are able to reach our product goals faster than any other marketplace we've tried. The reverse bidding works like magic for sourcing rare fashion pieces.",
                  user: "Carla Giordano",
                  activity: "Found limited edition sneakers",
                  gradient: "from-[#4A3AFF] to-[#9D4EDD]",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
                },
                {
                  stat: "5 categories",
                  label: "Browsed on Onseek",
                  quote: "The continual support and product evolution has been impressive. We've found everything from rare watches to specialized hardware with zero friction. It's the standard for serious buyers.",
                  user: "Peter Kang",
                  activity: "Sold a Custom PC Build",
                  gradient: "from-[#E0F23C] to-[#C9E015]",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
                  darkText: true
                },
                {
                  stat: "8 items",
                  label: "Secured globally",
                  quote: "Finding rare gear used to be a full-time job. Now I just post a request and let the best sellers in the world find me. It's the most efficient way to buy.",
                  user: "Cory Shoaf",
                  activity: "Secured a Vintage Leica M6",
                  gradient: "from-[#6B4EE0] to-[#E6B3FF]",
                  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
                },
                {
                  stat: "$450 saved",
                  label: "By negotiating on Onseek",
                  quote: "The technical gear we've sourced here has been flawless. The escrow system gives me total peace of mind for high-value transactions.",
                  user: "Vivek Ramakrishnan",
                  activity: "Found a high-end studio mic",
                  gradient: "from-[#FF8A00] to-[#FFB800]",
                  avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&auto=format&fit=crop",
                  darkText: true
                },
                {
                  stat: "$1,200 spent",
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
                      <div className="px-8 py-6 flex flex-col items-center text-center">
                        <span className={`text-3xl font-bold tracking-tight ${item.darkText ? 'text-black' : 'text-white'}`} style={{ fontFamily: 'var(--font-expanded)' }}>{item.stat}</span>
                        <span className={`text-[12px] font-bold mt-2 ${item.darkText ? 'text-black/60' : 'text-white/60'} uppercase tracking-widest`}>{item.label}</span>
                      </div>

                      <div className="bg-white rounded-[20px] p-6 md:p-8 -mt-2 relative z-10 flex flex-col justify-between flex-grow gap-8">
                        <div className="flex flex-col gap-6">
                          <div className="px-4 py-1.5 rounded-full border border-gray-100 w-fit text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                            {item.activity}
                          </div>
                          <p className="text-lg md:text-xl text-[#1A1A1A] font-medium leading-snug tracking-tight">
                            "{item.quote}"
                          </p>
                        </div>

                        <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                            <img src={item.avatar} alt={item.user} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-bold text-sm text-[#1A1A1A] tracking-tight">{item.user}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 bg-white">
          <InterceptBanner />
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}



function AnimatedRequestStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const cards = [
    { 
      id: 1, 
      title: "Vintage Leica M6", 
      price: "$3,200", 
      condition: "Like New",
      details: ["Box & Papers included", "Recent CLA service", "Near mint body"],
      status: "Finding...", 
      user: "@marco",
      bg: "#f5f6f9",
      ring: "ring-gray-900"
    },
    { 
      id: 2, 
      title: "Herman Miller Aeron", 
      price: "$850", 
      condition: "Used",
      details: ["Size B", "PostureFit SL", "Fully adjustable"],
      status: "2 Proposals", 
      user: "@sara",
      bg: "#f0fdf4",
      ring: "ring-emerald-900"
    },
    { 
      id: 3, 
      title: "Sony A7 IV Body", 
      price: "$2,100", 
      condition: "New",
      details: ["International warranty", "Body only", "In stock"],
      status: "Verified", 
      user: "@Onseek",
      bg: "#fef2f2",
      ring: "ring-rose-900"
    },
    { 
      id: 4, 
      title: "RTX 4090 FE", 
      price: "$1,600", 
      condition: "New",
      details: ["Original packaging", "Founders Edition", "Immediate ship"],
      status: "Looking", 
      user: "@techy",
      bg: "#eff6ff",
      ring: "ring-blue-900"
    },
    { 
      id: 5, 
      title: "Eames Lounge Chair", 
      price: "$5,000", 
      condition: "Excellent",
      details: ["Walnut & Leather", "Herman Miller auth", "Local pickup"],
      status: "Closed", 
      user: "@design",
      bg: "#fffbeb",
      ring: "ring-amber-900"
    },
  ];

  const xOffsets = [-420, -210, 0, 210, 420];
  const rotations = [-18, -9, 0, 9, 18];
  const yOffsets = [50, 20, 0, 20, 50];

  return (
    <section ref={containerRef} className="py-48 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center mb-40">
        <h2 className="text-5xl md:text-[80px] font-bold tracking-tight mb-8 leading-[0.9]" style={{ fontFamily: 'var(--font-expanded)' }}>
          Your intent, <br /><span className="text-[#6B4EE0]">beautifully fanned out.</span>
        </h2>
        <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium leading-relaxed">
          Post your request and watch as the best deals from around the world fan out before you.
        </p>
      </div>

      <div className="relative h-[500px] flex items-center justify-center">
        {cards.map((card, i) => {
          const x = useTransform(scrollYProgress, [0.1, 0.45], [0, xOffsets[i]]);
          const rotate = useTransform(scrollYProgress, [0.1, 0.45], [0, rotations[i]]);
          const y = useTransform(scrollYProgress, [0.1, 0.45], [0, yOffsets[i]]);
          const opacity = useTransform(scrollYProgress, [0, 0.1, 0.7, 0.85], [0, 1, 1, 0]);
          const scale = useTransform(scrollYProgress, [0.1, 0.45], [0.95, 1]);

          return (
            <motion.div
              key={card.id}
              style={{
                x,
                rotate,
                y,
                opacity,
                scale,
                zIndex: 10 - Math.abs(i - 2)
              }}
              className="absolute w-80 h-[480px] group cursor-pointer"
            >
              <div className="relative group w-full h-full flex flex-col">
                <div className="focus:outline-none h-full flex flex-col group/card">
                  <div className={cn(
                    "text-card-foreground flex flex-col relative w-full transition-all duration-200 ease-out shadow-none h-full bg-transparent rounded-[20px] overflow-hidden group-hover/card:ring-2 group-hover/card:ring-inset",
                    card.ring
                  )}>
                    <div className="flex-1 flex flex-col relative w-full h-full overflow-visible" style={{ perspective: "1200px" }}>
                      <div className="flex-1 relative w-full rounded-[20px] shadow-none border-none" style={{ transformStyle: "preserve-3d", transform: "none" }}>
                        <div className="relative w-full h-full flex flex-col p-0 rounded-[20px] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] border-none" style={{ backfaceVisibility: "hidden", transform: "translateZ(1px)", backgroundColor: card.bg }}>
                          <div className="flex flex-col h-full bg-transparent px-2 pb-0 sm:px-2 sm:pb-0 pt-1 sm:pt-1.5">
                            <section className="flex flex-col px-4 flex-1 h-full">
                              <div className="flex-1">
                                <div className="relative min-h-[200px]">
                                  <div className="absolute top-6 right-0 shrink-0 z-10 text-[#1A1A1A]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="tabler-icon tabler-icon-binoculars-filled h-8 w-8">
                                      <path d="M8.887 6.748c-.163 0 -.337 .016 -.506 .057c-.172 .041 -.582 .165 -.838 .562l-.014 .02l-.607 1.05c-.307 .205 -.534 .46 -.693 .717l-.014 .02l-2.572 4.65a4.009 4.009 0 0 0 -.274 .494l-.006 .01a3.99 3.99 0 0 0 -.363 1.672a4 4 0 0 0 8 0v-1h2v1a4 4 0 1 0 7.635 -1.67l-.004 -.012a4.008 4.008 0 0 0 -.274 -.494l-2.572 -4.65l-.014 -.02a2.337 2.337 0 0 0 -.693 -.716l-.607 -1.051l-.014 -.02c-.256 -.397 -.667 -.52 -.838 -.562a2.225 2.225 0 0 0 -.664 -.051a2.06 2.06 0 0 0 -.68 .156c-.184 .081 -.638 .327 -.754 .889l-.007 .037l-.14 1.1c-.22 .283 -.374 .64 -.374 1.064v1h-2v-1c0 -.424 -.154 -.781 -.373 -1.064l-.14 -1.1l-.008 -.037c-.116 -.562 -.57 -.808 -.754 -.889a2.06 2.06 0 0 0 -.68 -.156a2.374 2.374 0 0 0 -.158 -.006zm-1.887 7.252a2 2 0 1 1 -1.838 1.209l.19 -.342c.36 -.523 .964 -.867 1.648 -.867zm10 0c.684 0 1.288 .344 1.648 .867l.19 .342a2 2 0 1 1 -1.838 -1.209z"></path>
                                    </svg>
                                  </div>
                                  <div className="mb-4 pt-6 flex flex-col gap-4">
                                    <div className="flex flex-row items-start justify-between gap-8">
                                      <h1 className="font-semibold text-[#1A1A1A] flex-1 pr-12 text-[20px]" style={{ fontFamily: "var(--font-expanded)", fontWeight: 600, maxWidth: "100%" }}>
                                        {card.title}
                                      </h1>
                                    </div>
                                  </div>
                                  <div className="space-y-3 flex-1">
                                    {card.details.map((detail, idx) => (
                                      <div key={idx} className="flex items-center gap-4 py-3 group/item border-current border-dashed border-b text-[#1A1A1A]/70">
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                                        <span className="font-medium text-[#1A1A1A] text-[14px]">{detail}</span>
                                      </div>
                                    ))}
                                    <div className="py-3 font-medium opacity-30 text-[#1A1A1A] text-[14px]">And more details</div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-5 pb-0">
                                <div className="h-px -mx-5 sm:-mx-6 bg-current opacity-20 text-[#1A1A1A]"></div>
                                <div className="flex items-stretch -mx-5 sm:-mx-6">
                                  <div className="flex flex-col items-start flex-1 py-4 min-w-0 px-6 group/meta">
                                    <span className="font-bold text-[#1A1A1A] text-left truncate w-full text-[16px]">{card.condition}</span>
                                    <span className="text-[11px] font-normal leading-none mt-1 opacity-30 text-[#1A1A1A]">Condition</span>
                                  </div>
                                  <div className="w-px shrink-0 bg-current opacity-20 text-[#1A1A1A]"></div>
                                  <div className="flex flex-col items-start flex-1 py-4 min-w-0 px-6">
                                    <span className="font-bold text-[#1A1A1A] text-left truncate w-full text-[16px]">{card.price}</span>
                                    <span className="text-[11px] font-normal leading-none mt-1 opacity-30 text-[#1A1A1A]">Budget</span>
                                  </div>
                                </div>
                              </div>
                            </section>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { Check } from "lucide-react";

const testimonials = [
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
];

export function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[#7755FF] font-bold text-[13px] mb-4 tracking-tight uppercase">Success Stories</p>
          <h2 className="text-[40px] md:text-[64px] leading-[1] font-medium tracking-[-0.03em] mb-4 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>
            What our seekers say
          </h2>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {testimonials.map((item, i) => (
            <div key={i} className="break-inside-avoid relative group">
              <div className={`rounded-[24px] overflow-hidden bg-gradient-to-br ${item.gradient} p-[1px] transition-all h-full hover:shadow-2xl transition-shadow duration-500`}>
                <div className="flex flex-col h-full bg-white rounded-[23px] overflow-hidden">
                  {/* Header Content (Dark background based on gradient) */}
                  <div className={`px-8 py-10 flex flex-col items-center text-center bg-gradient-to-br ${item.gradient}`}>
                    <span className={`text-4xl font-medium tracking-tight ${item.darkText ? 'text-black' : 'text-white'}`} style={{ fontFamily: 'var(--font-expanded)' }}>{item.stat}</span>
                    <span className={`text-[12px] font-bold mt-3 uppercase tracking-wider opacity-60 ${item.darkText ? 'text-black' : 'text-white'}`}>{item.label}</span>
                  </div>

                  {/* Body Content */}
                  <div className="p-8 flex flex-col justify-between flex-grow gap-8">
                    <div className="flex flex-col gap-6">
                      <div className="px-4 py-2 rounded-full border border-gray-100 w-fit text-xs font-bold text-gray-400 uppercase tracking-tight">
                        {item.activity}
                      </div>
                      <p className="text-xl md:text-2xl text-[#1A1A1A] font-medium leading-[1.3] tracking-tight">
                        "{item.quote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-sm shrink-0">
                        <img src={item.avatar} alt={item.user} className="w-full h-full object-cover" />
                      </div>
                      <p className="font-bold text-lg text-[#1A1A1A] tracking-tight">{item.user}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

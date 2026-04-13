"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserChoiceSection() {
  const choices = [
    {
      title: "Seeker",
      subtitle: "I'm looking for something",
      description: "Post a Request and let the best items or services find you. No more endless searching.",
      features: [
        "Post limitless requests",
        "Verified seller network",
        "Set your own budget",
        "Save hours of browsing"
      ],
      cta: "Start seeking",
      variant: "default" as const
    },
    {
      title: "Hunter",
      subtitle: "I have items to sell",
      description: "Fulfill requests and turn your inventory or skills into sales with direct buyer access.",
      features: [
        "Access live demand",
        "Direct buyer messaging",
        "No upfront listing fees",
        "Build seller reputation"
      ],
      cta: "Start selling",
      variant: "featured" as const
    }
  ];

  return (
    <section className="py-24 px-10 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-[40px] md:text-[56px] leading-[1.05] mb-6 text-[#1A1A1A] font-extrabold tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-expanded)' }}
          >
            Choose your path
          </h2>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re hunting for the perfect item or have exactly what someone needs, Onseek is built for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {choices.map((choice, idx) => (
            <div 
              key={idx}
              className={cn(
                "relative flex flex-col p-10 rounded-[40px] transition-all duration-300 group",
                choice.variant === "featured" 
                  ? "bg-white border-2 border-[#1e2330] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)]" 
                  : "bg-white border-2 border-transparent shadow-sm hover:shadow-md"
              )}
            >
              {choice.variant === "featured" && (
                <div className="absolute -top-4 right-10 bg-[#1e2330] text-white text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  Live Demand
                </div>
              )}

              <div className="mb-8">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  {choice.title}
                </span>
                <h3 
                  className="text-3xl font-bold text-[#1A1A1A] leading-tight mb-4"
                  style={{ fontFamily: 'var(--font-expanded)' }}
                >
                  {choice.subtitle}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {choice.description}
                </p>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {choice.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      choice.variant === "featured" ? "bg-[#1e2330]/10" : "bg-gray-100"
                    )}>
                      <Check className={cn(
                        "w-3 h-3",
                        choice.variant === "featured" ? "text-[#1e2330]" : "text-gray-600"
                      )} />
                    </div>
                    <span className="text-[15px] font-medium text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                asChild
                className={cn(
                  "h-14 rounded-full text-lg font-bold transition-all hover:scale-[1.02]",
                  choice.variant === "featured"
                    ? "bg-[#1e2330] text-white hover:bg-[#2a303f]"
                    : "bg-white text-[#1e2330] border-2 border-[#1e2330] hover:bg-gray-50"
                )}
              >
                <Link href="/signup" className="flex items-center justify-center gap-2">
                  {choice.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

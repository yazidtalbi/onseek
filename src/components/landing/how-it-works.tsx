"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    title: "Post a request",
    description: "Describe what you need and your budget. Our AI helps structure your request in seconds.",
    image: "/landing/how_it_works_post.png",
    cta: "Create a request",
    link: "/new"
  },
  {
    title: "Get links and options",
    description: "Hunters across the globe search for the best prices and conditions for your specific needs.",
    image: "/landing/how_it_works_links.png"
  },
  {
    title: "Pick the perfect find",
    description: "Choose the winning submission, pay the hunter, and get exactly what you were looking for.",
    image: "/landing/how_it_works_choose.png"
  }
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h2 className="text-[40px] font-bold tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>
              How it works
            </h2>
          </div>
          
          <div className="flex bg-gray-50 p-1 rounded-full border border-gray-100">
            <button className="px-6 py-2 rounded-full bg-white shadow-sm text-sm font-semibold text-[#1A1A1A] border border-gray-100 transition-all">
              For seekers
            </button>
            <button className="px-6 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-900 transition-all">
              For hunters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="group items-start flex flex-col">
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-8 bg-gray-100">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3 group-hover:text-[#7755FF] transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-500 text-base leading-relaxed mb-6">
                {step.description}
              </p>
              
              {step.cta && (
                <Button asChild className="rounded-full px-8 h-12 bg-[#1A1A1A] hover:bg-black transition-all">
                  <Link href={step.link!}>{step.cta}</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is Onseek?",
    answer: "Onseek is a reverse marketplace where buyers state exactly what they need, and sellers compete to offer the best matches. It cuts through the noise of traditional searching."
  },
  {
    question: "How do I become a seller?",
    answer: "For the moment, every user can submit proposals from their inventory. Official shops are currently in our roadmap."
  },
  {
    question: "Is it free?",
    answer: "Yes, it is completely free to post requests and submit offers."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full mx-auto py-24 mb-12">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="flex flex-col gap-16">
          {/* Top: Title and Image Flexed */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-4">
            <h2 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.05] font-bold tracking-[-0.03em] text-[#1A1A1A] max-w-2xl" style={{ fontFamily: 'var(--font-expanded)' }}>
              Frequently asked<br className="hidden sm:block" /> questions
            </h2>
            <div className="shrink-0 scale-110 md:scale-125 origin-center md:origin-right transform px-8">
              <img src="/illustrations/faq-cat.png" alt="Questions" className="w-20 md:w-28 h-auto object-contain opacity-90" />
            </div>
          </div>

          {/* Bottom: Accordion Full Width */}
          <div className="w-full">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="border-b border-gray-100 last:border-0"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
                  >
                    <span 
                      className="text-[19px] md:text-[22px] font-semibold text-[#1A1A1A] tracking-[-0.01em] pr-8 transition-colors group-hover:text-gray-600"
                      style={{ fontFamily: 'var(--font-expanded)' }}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0", isOpen && "rotate-180 text-[#6925DC]")} />
                  </button>
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-[300px] opacity-100 pb-10" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="text-[17px] md:text-[18px] text-gray-500 leading-relaxed font-medium max-w-4xl">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

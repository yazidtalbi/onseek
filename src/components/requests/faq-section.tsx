"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is it free?",
    answer: "Yes, it is completely free to post requests and submit offers. No hidden fees or commissions."
  },
  {
    question: "Who can post a request?",
    answer: "Anyone. Whether you're looking for a physical product, a digital service, or something in between — if you know what you need, just describe it and let sellers find you."
  },
  {
    question: "How do I become a seller?",
    answer: "For the moment, every user can submit proposals from their inventory. Official shops are currently in our roadmap."
  },
  {
    question: "How long until I get proposals?",
    answer: "Most requests receive their first offer within 24 hours. The average time to find a perfect match is 3–5 days."
  },
  {
    question: "Can I cancel my request?",
    answer: "Yes. You can close your request at any time — if you found the item elsewhere or changed your mind, simply mark it as closed from your dashboard."
  },
  {
    question: "How do payments work?",
    answer: "We recommend using our integrated escrow system, which holds funds securely until you verify the item upon delivery. Safe for both sides."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full mx-auto py-4">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="bg-gray-50 rounded-[32px] p-8 md:p-16 lg:p-20">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            {/* Left: Title */}
            <div className="lg:w-1/3 shrink-0">
              <h2 className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.05] font-bold tracking-[-0.03em] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>
                FAQ
              </h2>
            </div>
  
            {/* Right: Accordion */}
            <div className="flex-1">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className="border-b border-gray-200 last:border-0"
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
                      <div className="text-[17px] md:text-[18px] text-gray-500 leading-relaxed font-medium">
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
    </div>
  );
}

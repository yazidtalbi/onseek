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
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          {/* Left: Title */}
          <div className="lg:w-[40%] flex flex-col items-start">
            <img src="/illustrations/faq-cat.png" alt="Questions" className="w-20 md:w-24 h-auto object-contain opacity-90 mb-6" />
            <h2 className="text-[40px] md:text-[56px] leading-[1.05] font-medium tracking-[-0.03em] text-foreground" style={{ fontFamily: 'var(--font-expanded)' }}>
              Frequently asked<br />questions
            </h2>
          </div>

          {/* Right: Accordion */}
          <div className="flex-1 border-t border-gray-100 w-full">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="border-b border-gray-100"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
                  >
                    <span 
                      className="text-[18px] md:text-[20px] font-medium text-foreground tracking-[-0.01em] pr-8 transition-colors group-hover:text-gray-600"
                      style={{ fontFamily: 'var(--font-expanded)' }}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown className={cn("w-5 h-5 text-foreground transition-transform duration-300 shrink-0", isOpen && "rotate-180")} />
                  </button>
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-[200px] opacity-100 pb-8" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="text-[16px] md:text-[17px] text-gray-500 leading-relaxed font-normal max-w-xl">
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

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is a Proposal?",
    answer: "A Proposal is a direct response to a Seeker’s request. It can be one of two things: \n\n1. A Public Link: A curated find from across the web (like a rare listing or a specific product page). \n2. A Personal Item: A direct offer for an item the Seller owns and is ready to ship."
  },
  {
    question: "Is Onseek international?",
    answer: "Yes. Onseek is a global platform designed for international requests and proposals. Whether you're looking for a rare collectible from Japan or a specific digital service, the community spans the globe."
  },
  {
    question: "Does Onseek handle payments?",
    answer: "No. Onseek is a platform for discovery and connection. We help you find what you need through community expertise. Once you pick a winning proposal, the actual transaction happens directly between you and the seller on your own terms."
  },
  {
    question: "How do I find my item after picking a winner?",
    answer: "When you accept a proposal, the \"Solver\" will provide you with the direct link, location, or contact details for the item. You then complete the purchase through the original source or directly with them."
  },
  {
    question: "Is there a fee to use Onseek?",
    answer: "Onseek is currently free to use for both Seekers and Solvers. Our goal is to make the hunt for the perfect item as seamless as possible."
  },
  {
    question: "What do I get for finding an item?",
    answer: "By submitting winning proposals, you build your reputation as a top \"Solver\" in the community. (Stay tuned for our upcoming rewards and reputation system.)"
  },
  {
    question: "Can I link to my own shop?",
    answer: "Absolutely. If you have the item the Seeker is looking for, you can send a proposal linking directly to your own storefront or marketplace listing."
  },
  {
    question: "How do I know a proposal is legit?",
    answer: "Onseek allows you to view the Solver's profile and history. However, because payments happen off-platform, we always recommend following standard safety practices when purchasing from external links or third parties."
  },
  {
    question: "What if a link is broken or fake?",
    answer: "You can report inaccurate or suspicious proposals directly through the app. Our community thrives on accuracy, and we take quality control seriously."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-0">
      {/* Header */}
      <div className="mb-12">
        <h2 
          className="text-[28px] md:text-[32px] font-bold text-[#1A1A1A] mb-4" 
          style={{ fontFamily: 'var(--font-expanded)' }}
        >
          Got questions?
        </h2>
        <div className="w-full h-[2px] bg-black opacity-10" />
      </div>

      {/* Accordion List */}
      <div className="flex flex-col">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="border-b border-gray-100 last:border-0"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between py-3 text-left focus:outline-none group"
              >
                <span 
                  className="text-[17px] md:text-[19px] font-semibold text-[#1A1A1A] tracking-[-0.01em] pr-8 transition-colors"
                  style={{ fontFamily: 'var(--font-expanded)' }}
                >
                  {faq.question}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-[#1A1A1A] transition-transform duration-300 shrink-0", isOpen && "rotate-180")} />
              </button>
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "max-h-[300px] opacity-100 pb-8" : "max-h-0 opacity-0"
                )}
              >
                <div className="text-[16px] text-gray-500 leading-relaxed font-medium">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

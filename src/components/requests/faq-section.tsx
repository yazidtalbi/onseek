"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is Onseek?",
    answer: "Onseek is a reverse marketplace where buyers state exactly what they need, and sellers compete to offer the best matches. It cuts through the noise of traditional searching."
  },
  {
    question: "How do I become a seller?",
    answer: "You can sign up as a seller. Once your profile is ready, you can start fulfilling requests and making offers on public listings."
  },
  {
    question: "Is it free to post a request?",
    answer: "Yes, posting a request is completely free. You only pay when you decide to proceed with an offer from a seller."
  },
  {
    question: "How are payments handled?",
    answer: "Payments are securely held until the transaction is successfully completed, ensuring safety for both buyers and sellers."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full mx-auto py-12 mb-8">
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 mb-10 text-center" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-3 max-w-3xl mx-auto">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={cn(
                "rounded-3xl transition-all duration-300 overflow-hidden",
                isOpen ? "bg-white border border-[#e6e7eb]" : "bg-[#f9fafb] hover:bg-[#f3f4f6]"
              )}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
              >
                <span className="text-[16px] font-semibold text-gray-900">{faq.question}</span>
                <ArrowDown className={cn("w-4 h-4 text-[#7860fe] transition-transform duration-300", isOpen && "rotate-180")} />
              </button>
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="px-6 pb-6 pt-0 text-[15px] text-gray-500 leading-relaxed font-medium">
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

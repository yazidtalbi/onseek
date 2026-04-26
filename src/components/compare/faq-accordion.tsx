"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, idx) => (
        <div key={idx}>
          <button
            className="w-full flex items-center justify-between py-5 text-left group"
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
          >
            <span className="text-[15px] font-semibold text-[#1A1A1A] pr-6 leading-snug group-hover:text-gray-600 transition-colors">
              {item.question}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                open === idx ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              open === idx ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-lg text-gray-700 leading-[1.8]">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

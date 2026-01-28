"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  author: string;
  title: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Okay this is genius. Crazy it took so long for a tool like this to exist. Onseek is dominating this space.",
    author: "Brett",
    title: "Designjoy",
  },
  {
    quote: "The best way to find exactly what you're looking for. The community always delivers quality results.",
    author: "Sarah",
    title: "Product Hunter",
  },
  {
    quote: "I've saved so much time and money using Onseek. The proposals are always spot-on.",
    author: "Alex",
    title: "Tech Enthusiast",
  },
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-rotate testimonials
  React.useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="flex flex-col h-full justify-center">
      {/* Testimonial */}
      <div className="mb-12">
        <div className="relative">
          <p className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-6">
            "{current.quote}"
          </p>
          <div className="flex items-center gap-3 mt-8">
            <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold text-lg">
              {current.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{current.author}</p>
              <p className="text-sm text-gray-600">{current.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center gap-2 mb-12">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              index === currentIndex
                ? "w-8 bg-[#7755FF]"
                : "w-2 bg-gray-300"
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Trusted by section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Trusted by creators
          </span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <div className="flex items-center justify-center gap-8 opacity-60">
          <div className="text-sm font-semibold text-gray-600">Framer</div>
          <div className="text-sm font-semibold text-gray-600">BARREL</div>
          <div className="text-sm font-semibold text-gray-600">BILT</div>
          <div className="text-sm font-semibold text-gray-600">scale</div>
        </div>
      </div>
    </div>
  );
}


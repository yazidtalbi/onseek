"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "conflict", label: "01. The Conflict" },
  { id: "comparison", label: "Feature Comparison" },
  { id: "how-it-works", label: "The Onseek Advantage" },
  { id: "use-cases", label: "Use Cases" },
  { id: "faq", label: "FAQs" },
];

interface StickyNavProps {
  accentColor: string;
}

export function StickyNav({ accentColor }: StickyNavProps) {
  const [activeId, setActiveId] = useState<string>("conflict");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <aside className="sticky top-24 hidden lg:block h-fit w-64 border-l border-gray-100 pl-6">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 font-semibold">
        Contents
      </p>
      <nav className="space-y-4">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              style={isActive ? { color: accentColor } : undefined}
              className={`block text-sm transition-colors duration-200 ${
                isActive
                  ? "font-semibold"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {section.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

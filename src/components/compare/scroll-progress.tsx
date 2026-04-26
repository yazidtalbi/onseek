"use client";

import { useEffect, useState } from "react";

interface ScrollProgressProps {
  color: string;
}

export function ScrollProgress({ color }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      setProgress(docHeight > 0 ? (scrolled / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-gray-100">
      <div
        className="h-full transition-all duration-100 ease-linear"
        style={{ width: `${progress}%`, backgroundColor: color }}
      />
    </div>
  );
}

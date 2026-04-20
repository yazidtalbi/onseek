"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Hide on certain pages - moved below hooks to avoid React errors
  if (pathname === "/requests/match" || pathname.startsWith("/requests/")) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-[#7755FF] text-white hover:bg-[#7755FF]/90 shadow-lg"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
}


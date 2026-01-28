"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoadingBar() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Reset and start loading
    setProgress(0);
    
    // Simulate progress
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 90;
        }
        // Increment by random amount for smoother animation
        return prev + Math.random() * 15;
      });
    }, 100);

    // Complete the progress after navigation completes
    timerRef.current = setTimeout(() => {
      setProgress(100);
      // Hide after completion animation
      setTimeout(() => {
        setProgress(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 200);
    }, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname, searchParams]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-[#7755FF] transition-all duration-150 ease-out"
        style={{
          width: `${Math.min(progress, 100)}%`,
        }}
      />
    </div>
  );
}


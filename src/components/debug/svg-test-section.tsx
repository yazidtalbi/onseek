"use client";

import React, { useEffect, useRef } from "react";

export function SvgTestSection() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load GSAP from CDN
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    script.async = true;
    script.onload = () => {
      if (!window.gsap || !svgRef.current) return;

      const gsap = window.gsap;
      const paths = svgRef.current.querySelectorAll("path");

      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length.toString();
        path.style.strokeDashoffset = length.toString();
      });

      // timeline
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.out",
        stagger: 0.15
      });

      // subtle floating motion
      gsap.to(svgRef.current, {
        y: 10,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // slight glow pulse
      gsap.to(paths, {
        stroke: "#9d6bff",
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: stop animations if possible or just remove script
      if (window.gsap) {
        window.gsap.killTweensOf(svgRef.current);
        const paths = svgRef.current?.querySelectorAll("path");
        if (paths) window.gsap.killTweensOf(paths);
      }
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="my-16 p-12 rounded-[40px] bg-[#0f0f13] border border-white/5 overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white/90" style={{ fontFamily: 'var(--font-expanded)' }}>
            SVG GSAP Animation
          </h2>
          <p className="text-white/50 font-medium leading-relaxed">
            Testing the new GSAP-powered SVG animation with path drawing, floating motion, and glow pulse.
          </p>
        </div>
        <div className="w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden bg-[#16161c] border border-white/5 p-8 flex items-center justify-center shadow-2xl">
          <div ref={containerRef} className="w-full h-full flex items-center justify-center">
            <svg 
              ref={svgRef}
              viewBox="0 0 500 500" 
              className="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M50 250 Q250 50 450 250" 
                stroke="#7b3ff2"
                strokeWidth="2"
                fill="none"
              />
              {/* Adding a few more paths to make the stagger effect visible */}
              <path 
                d="M50 300 Q250 100 450 300" 
                stroke="#7b3ff2"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <path 
                d="M50 350 Q250 150 450 350" 
                stroke="#7b3ff2"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

// Add type definition for window.gsap
declare global {
  interface Window {
    gsap: any;
  }
}

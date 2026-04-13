"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RequestAnimationSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // Step 0: Pill (initial state)
      setStep(0);
      
      // Step 1: Shrink Pill into Ring
      await new Promise(r => setTimeout(r, 1500));
      setStep(1);

      // Step 2: Pop out the Flower
      await new Promise(r => setTimeout(r, 800));
      setStep(2);

      // Step 3: Shrink Flower and Fade in Card
      await new Promise(r => setTimeout(r, 1400));
      setStep(3);

      // Reset sequence after a delay
      await new Promise(r => setTimeout(r, 3000));
    };

    const interval = setInterval(sequence, 6700);
    sequence(); // Run initially

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#111111] py-32 px-6 overflow-hidden flex items-center justify-center min-h-[500px]">
      <div className="relative w-[500px] h-[400px] flex items-center justify-center">
        
        {/* Glowing Aura */}
        <motion.div 
          className="absolute w-[400px] h-[400px] glow-bg rounded-full z-0"
          animate={{
            scale: step === 0 ? 0.8 : step === 1 ? 1.2 : step === 2 ? 1.5 : 2,
            opacity: step === 3 ? 0.2 : 0.6
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* The Pill / Ring */}
        <motion.div
          className="absolute z-10 flex items-center justify-center text-[#b3b3b3] border-2 overflow-hidden"
          animate={{
            width: step === 0 ? 240 : 64,
            height: 64,
            backgroundColor: step === 0 ? "#333333" : "#000000",
            borderColor: step === 0 ? "transparent" : "var(--neon-green)",
            borderRadius: 40,
            opacity: step < 2 ? 1 : 0,
            scale: step < 2 ? 1 : 0.8
          }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.span 
            className="text-[19px] font-medium whitespace-nowrap px-6"
            animate={{ opacity: step === 0 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            Describe your request
          </motion.span>
        </motion.div>

        {/* The Flower / Atom */}
        <motion.div
          className="absolute z-20 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={{
            opacity: step === 2 ? 1 : 0,
            scale: step === 2 ? 0.8 : step === 3 ? 0.15 : 0,
            rotate: step === 2 ? 0 : step === 3 ? 90 : -90
          }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {[0, 45, 90, 135].map((deg) => (
            <div 
              key={deg} 
              className="petal" 
              style={{ transform: `rotate(${deg}deg)` }} 
            />
          ))}
        </motion.div>

        {/* The Cost Estimate Card */}
        <motion.div
          className="absolute z-30 w-[380px] h-[220px] bg-gradient-to-b from-[#1c1c1c] to-[#111111] border border-white/10 rounded-[24px] flex flex-col p-6 shadow-2xl overflow-hidden pointer-events-none"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{
            opacity: step === 3 ? 1 : 0,
            y: step === 3 ? 0 : 24,
            scale: step === 3 ? 1 : 0.95
          }}
          transition={{ duration: 0.9, ease: "easeOut", delay: step === 3 ? 0.2 : 0 }}
        >
          <h3 className="text-white text-center text-lg font-medium tracking-wide mb-6">Cost estimate</h3>
          
          <div className="relative flex-1 w-full mt-2">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--neon-green)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--neon-green)" stopOpacity="0" />
                </linearGradient>
                <clipPath id="chart-clip">
                  <rect x="75" y="0" width="150" height="100" />
                </clipPath>
              </defs>
              
              <path d="M 0 90 C 60 90, 80 20, 150 20 C 220 20, 240 90, 300 90" fill="none" stroke="#444" strokeWidth="2" />
              
              <motion.path 
                d="M 0 90 C 60 90, 80 20, 150 20 C 220 20, 240 90, 300 90" 
                fill="none" 
                stroke="var(--neon-green)" 
                strokeWidth="3" 
                clipPath="url(#chart-clip)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: step === 3 ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              
              <motion.path 
                d="M 0 90 C 60 90, 80 20, 150 20 C 220 20, 240 90, 300 90 L 300 100 L 0 100 Z" 
                className="chart-gradient" 
                clipPath="url(#chart-clip)"
                initial={{ opacity: 0 }}
                animate={{ opacity: step === 3 ? 1 : 0 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </svg>

            <div className="absolute w-full h-full">
              <motion.div 
                className="absolute left-[75px] top-[32px] -translate-x-1/2 -translate-y-1/2 bg-black border-[1.5px] border-[#bdf235] text-white text-[13px] px-3 py-1 rounded-full font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: step === 3 ? 1 : 0, scale: step === 3 ? 1 : 0.8 }}
                transition={{ delay: 1.2 }}
              >
                $30/hr
              </motion.div>
              
              <motion.div 
                className="absolute left-[225px] top-[32px] -translate-x-1/2 -translate-y-1/2 bg-black border-[1.5px] border-[#bdf235] text-white text-[13px] px-3 py-1 rounded-full font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: step === 3 ? 1 : 0, scale: step === 3 ? 1 : 0.8 }}
                transition={{ delay: 1.4 }}
              >
                $50/hr
              </motion.div>

              <motion.div 
                className="absolute left-1/2 top-[55px] -translate-x-1/2 text-[#bdf235] text-[13px] font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: step === 3 ? 1 : 0 }}
                transition={{ delay: 1.6 }}
              >
                Typical
              </motion.div>

              <div className="absolute bottom-[-10px] left-0 text-gray-500 text-[12px]">Affordable</div>
              <div className="absolute bottom-[-10px] right-0 text-gray-500 text-[12px]">Experts</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

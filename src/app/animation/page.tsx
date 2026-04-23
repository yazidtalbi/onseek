'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, MousePointer2, Cpu, Zap, Search, Sparkles } from 'lucide-react';

type AnimationStyle = 'pulse' | 'magnet' | 'terminal' | 'scroller';
type Status = 'idle' | 'thinking' | 'result';

const PREFERENCES = [
  "Gaming mouse",
  "Green LED lighting",
  "Similar to 2016 Razer Chroma"
];

const RAW_INPUT = "I'm looking for a gaming mouse with green LED lighting, maybe something that looks like the old 2016 Razer Chroma model. Budget is negotiable, can be new or used.";
const KEYWORDS = ["Gaming", "Green", "LED", "2016", "Razer", "Chroma", "Mouse", "Negotiable", "Used"];

export default function AnimationTestPage() {
  const [style, setStyle] = useState<AnimationStyle>('pulse');
  const [status, setStatus] = useState<Status>('idle');
  const [showKeywords, setShowKeywords] = useState(false);

  const startAnimation = () => {
    setStatus('thinking');
    if (style === 'magnet') setShowKeywords(true);
    
    setTimeout(() => {
      setStatus('result');
      setShowKeywords(false);
    }, style === 'scroller' ? 6000 : 4500);
  };

  const reset = () => {
    setStatus('idle');
    setShowKeywords(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] p-4 sm:p-8 flex flex-col items-center justify-center font-sans overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
        
        {/* Left Side: Controls & Raw Input */}
        <div className="w-full lg:w-[400px] flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">AI Extraction</h1>
            <p className="text-gray-500">Testing transitions from unstructured text to structured cards.</p>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block text-center lg:text-left">Select Animation Style</label>
            <div className="grid grid-cols-4 gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              {(['pulse', 'magnet', 'terminal', 'scroller'] as AnimationStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStyle(s); reset(); }}
                  className={`px-2 py-2.5 rounded-xl text-[9px] font-bold transition-all ${
                    style === s 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50'
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Raw User Input</span>
                </div>
                <p className="text-[15px] leading-relaxed text-gray-600 italic">
                  "{RAW_INPUT}"
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startAnimation}
                disabled={status === 'thinking'}
                className="flex-1 px-8 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-sm hover:bg-black transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
              >
                {status === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Extract Data
              </button>
              <button
                onClick={reset}
                className="px-6 py-4 bg-white border border-gray-100 text-[#1A1A1A] rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: The Card or Scroller */}
        <div className="relative w-full max-w-[450px] min-h-[400px] flex items-center justify-center">
          {/* Keyword Magnet Overlay */}
          <AnimatePresence>
            {showKeywords && (
              <div className="absolute inset-0 pointer-events-none z-50">
                {KEYWORDS.map((word, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: -200 - Math.random() * 100, 
                      y: Math.random() * 400 - 200, 
                      opacity: 0,
                      scale: 0.5
                    }}
                    animate={{ 
                      x: [null, Math.random() * 100 - 50, 0],
                      y: [null, Math.random() * 100 - 50, 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5]
                    }}
                    transition={{ 
                      duration: 2.5,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                    className="absolute font-bold text-indigo-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-indigo-100 text-[10px] whitespace-nowrap"
                    style={{ 
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {word}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {style === 'scroller' && status === 'thinking' ? (
              <motion.div
                key="dictionary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full h-[400px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative p-12"
              >
                <DictionaryHighlight text={RAW_INPUT} />
              </motion.div>
            ) : (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                <RequestCard style={style} status={status} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

function RequestCard({ style, status }: { style: AnimationStyle; status: Status }) {
  return (
    <div className="p-1 sm:p-1.5 rounded-[24px] flex flex-col gap-1 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-gray-100">
      <div className="text-card-foreground flex flex-col relative w-full transition-all duration-300 ease-out bg-transparent overflow-hidden rounded-[20px] font-medium h-full">
        
        {/* Scanning Beam for Pulse style */}
        {status === 'thinking' && style === 'pulse' && (
          <motion.div 
            className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-indigo-400/10 to-transparent z-20 pointer-events-none"
            initial={{ top: '-20%' }}
            animate={{ top: '120%' }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        )}

        <div className="flex flex-col h-full bg-transparent px-2 pb-0 sm:px-2 sm:pb-0 pt-1 sm:pt-1.5">
          <section className="flex flex-col px-4 flex-1">
            
            {/* Title Section */}
            <div className="mb-4 pt-6">
              {status === 'idle' ? (
                <div className="h-8 w-2/3 bg-gray-50 rounded-lg" />
              ) : status === 'thinking' ? (
                <ThinkingTitle style={style} />
              ) : (
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-semibold text-[#1A1A1A] text-[22px] sm:text-[24px]" 
                  style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif", letterSpacing: "-0.02em", maxWidth: "80%" }}
                >
                  Gaming Mouse with Green LED
                </motion.h1>
              )}
            </div>

            <div className="space-y-5">
              <div className="flex flex-col">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[14px] font-bold text-black/10 uppercase tracking-widest">Preferences</h4>
                    <div className="flex flex-col">
                      {PREFERENCES.map((pref, idx) => (
                        <PreferenceItem 
                          key={idx} 
                          text={pref} 
                          index={idx} 
                          status={status} 
                          style={style} 
                          isLast={idx === PREFERENCES.length - 1} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-5">
                <div className="h-px -mx-5 sm:-mx-6 text-gray-100 bg-current" />
                <div className="flex items-stretch -mx-5 sm:-mx-6">
                  <FooterStat label="Condition" value="New & Used" status={status} index={0} style={style} />
                  <div className="w-px shrink-0 text-gray-100 bg-current" />
                  <FooterStat label="Budget" value="Negotiable" status={status} index={1} style={style} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PreferenceItem({ text, index, status, style, isLast }: { text: string; index: number; status: Status; style: AnimationStyle; isLast: boolean }) {
  return (
    <div className={`relative flex items-center gap-4 py-4 ${!isLast ? 'border-b border-dashed border-gray-100' : ''}`}>
      <AnimatePresence mode="wait">
        {status === 'thinking' ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 w-full"
          >
            <ThinkingContent style={style} text={text} index={index} />
          </motion.div>
        ) : status === 'result' ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
            className="flex items-center gap-4 w-full"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.15 + 0.2, type: "spring" }}
              className="flex h-4 w-4 shrink-0 items-center justify-center bg-emerald-50 rounded-full"
            >
              <Check className="h-3 w-3 text-emerald-500" strokeWidth={4} />
            </motion.div>
            <span className="text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]">
              {text}
            </span>
          </motion.div>
        ) : (
          <div key="idle" className="flex items-center gap-4 w-full">
            <div className="w-4 h-4 rounded-full bg-gray-50" />
            <div className="h-4 w-3/4 bg-gray-50 rounded" />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ThinkingContent({ style, text, index }: { style: AnimationStyle; text: string; index: number }) {
  if (style === 'pulse') {
    return (
      <div className="flex items-center gap-4 w-full relative overflow-hidden">
        <div className="w-4 h-4 rounded-full bg-indigo-50 animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-50 rounded relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/50 to-transparent w-full h-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: index * 0.2 }}
          />
        </div>
      </div>
    );
  }

  if (style === 'scroller') {
    return (
      <div className="flex items-center gap-4 w-full h-8">
        <div className="w-4 h-4 rounded-full bg-indigo-50 flex items-center justify-center">
           <Zap className="w-2.5 h-2.5 text-indigo-500 fill-indigo-500 animate-pulse" />
        </div>
        <div className="h-full flex-1 overflow-hidden relative">
          <VerticalHighlightScroller text={text} speed={0.5} />
        </div>
      </div>
    );
  }

  if (style === 'magnet') {
    return (
      <div className="flex items-center gap-4 w-full">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
        <div className="h-4 w-2/3 bg-indigo-50/50 rounded-full" />
      </div>
    );
  }

  if (style === 'terminal') {
    return (
      <div className="flex items-center gap-4 w-full">
        <div className="w-4 h-4 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
        </div>
        <div className="font-mono text-[13px] text-indigo-500/70">
          <DecodingText text={text} />
        </div>
      </div>
    );
  }

  return null;
}

function VerticalHighlightScroller({ text, speed = 1 }: { text: string; speed?: number }) {
  const words = text.split(' ');
  
  return (
    <div className="relative h-full w-full">
      {/* Top and Bottom Fades */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10" />
      
      <motion.div
        className="flex flex-col gap-1"
        animate={{ y: [0, -words.length * 20] }}
        transition={{ 
          duration: words.length * 0.4 * (1/speed), 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {words.concat(words).map((word, i) => (
          <motion.span
            key={i}
            className="text-[12px] font-bold text-gray-300 h-5 flex items-center"
            animate={{ 
              color: i % words.length === 0 ? ['#D1D5DB', '#6366F1', '#D1D5DB'] : '#D1D5DB'
            }}
            transition={{ duration: 1, repeat: Infinity, delay: (i % words.length) * 0.1 }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

function ThinkingTitle({ style }: { style: AnimationStyle }) {
  if (style === 'terminal') {
    return <div className="font-mono text-xl text-indigo-600"><DecodingText text="Gaming Mouse with Green LED" /></div>;
  }
  if (style === 'scroller') {
    return (
      <div className="h-10 w-full overflow-hidden relative border-l-2 border-indigo-500 pl-4">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10" />
        <motion.div
          className="flex flex-col gap-2"
          animate={{ y: [0, -40] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        >
          <span className="text-xl font-bold text-indigo-600 italic">Analyzing context...</span>
          <span className="text-xl font-bold text-gray-400 italic">Extracting keywords...</span>
          <span className="text-xl font-bold text-indigo-600 italic">Formatting data...</span>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="h-8 w-2/3 bg-indigo-50/50 rounded-lg relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-full h-full"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
}

function DecodingText({ text }: { text: string }) {
  const [display, setDisplay] = useState('');
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) return text[index];
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1/3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{display}</span>;
}

function DictionaryHighlight({ text }: { text: string }) {
  const words = text.split(' ');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % words.length);
    }, 150);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="relative h-full w-full font-serif italic text-2xl leading-[1.6] text-gray-800">
      {/* Dictionary Fades */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
      
      <motion.div
        className="flex flex-wrap gap-x-2 gap-y-4 pt-[150px]"
        animate={{ y: -activeIndex * 8 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {words.map((word, i) => (
          <div key={i} className="relative inline-block">
            {/* Highlighter Pen Effect */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: i === activeIndex ? '100%' : i < activeIndex ? '100%' : '0%' }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute bottom-0.5 left-0 h-4 -z-10 rounded-sm",
                i % 3 === 0 ? "bg-orange-200/60" : "bg-indigo-200/60"
              )}
            />
            <span className={cn(
              "transition-colors duration-200",
              i === activeIndex ? "text-black" : i < activeIndex ? "text-gray-400" : "text-gray-200"
            )}>
              {word}
            </span>
          </div>
        ))}
      </motion.div>
      
      <div className="absolute bottom-8 left-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500 z-20">
        <Loader2 className="w-3 h-3 animate-spin" />
        Deep analysis in progress...
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function FooterStat({ label, value, status, index, style }: { label: string; value: string; status: Status; index: number; style: AnimationStyle }) {
  return (
    <div className="flex flex-col items-start flex-1 py-4 min-w-0 px-6">
      <AnimatePresence mode="wait">
        {status === 'result' ? (
          <motion.span 
            key="value"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + (index * 0.1) }}
            className="text-[16px] sm:text-[18px] font-bold text-[#1A1A1A] leading-tight text-left truncate w-full"
          >
            {value}
          </motion.span>
        ) : status === 'thinking' ? (
          <motion.div 
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-5 w-20 bg-indigo-50/50 rounded relative overflow-hidden mb-1"
          >
             {style === 'pulse' && (
               <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-full h-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
             )}
          </motion.div>
        ) : (
          <div key="idle" className="h-5 w-20 bg-gray-50 rounded mb-1" />
        )}
      </AnimatePresence>
      <span className="text-[11px] font-bold uppercase tracking-wider mt-1 text-gray-300">
        {label}
      </span>
    </div>
  );
}

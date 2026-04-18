"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Sparkles, Loader2, ArrowRight, Check, Plus, DollarSign, Calendar, ShieldCheck, Crown, LockKeyhole, Pencil, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem } from "@/lib/types";
import { createRequestAction } from "@/actions/request.actions";
import { useQueryClient } from "@tanstack/react-query";
import { getRequestTheme } from "@/lib/utils/request-themes";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { CATEGORIES } from "@/lib/gemini";

interface AIRequestFlowProps {
  initialText: string;
  onClose: () => void;
  user: any;
  profile: any;
}

type FlowStep = "extracting" | "summary" | "urgency" | "budget" | "preview" | "auth" | "submitting";

export function AIRequestFlow({ initialText, onClose, user, profile }: AIRequestFlowProps) {
  const [step, setStep] = React.useState<FlowStep>("extracting");
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("signup");
  const [extractedData, setExtractedData] = React.useState<any>(null);
  const [urgency, setUrgency] = React.useState<string | null>(null);
  const [budget, setBudget] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [editingField, setEditingField] = React.useState<'title' | 'condition' | 'budget' | 'preferences' | 'dealbreakers' | 'images' | 'category' | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const STORAGE_KEY = "onseek_ai_draft";

  // Restore persistence on mount
  React.useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExtractedData(parsed.extractedData);
        setUrgency(parsed.urgency);
        setBudget(parsed.budget);
        
        // If we were at auth and now have user, go to submitting
        if (parsed.step === "auth" && user) {
          setStep("auth"); // This will trigger the auto-submit useEffect
        } else {
          setStep(parsed.step);
        }
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, []);

  // Save persistence on change
  React.useEffect(() => {
    if (step !== "submitting") {
      const draft = { extractedData, urgency, budget, step, initialText };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } else {
      // Clear persistence once we start submitting successfully
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [step, extractedData, urgency, budget, initialText]);

  // Auto-submit after auth
  React.useEffect(() => {
    // We only auto-submit if:
    // 1. In 'auth' or 'preview' step (came from registration or was ready to post)
    // 2. We have user AND profile (onboarding finished)
    // 3. We have restored extractedData
    if ((step === "auth" || step === "preview") && user && profile && extractedData && step !== "submitting") {
      console.log("Auto-submitting draft due to auth success...");
      handleFinish();
    }
  }, [step, user, profile, extractedData]);
  React.useEffect(() => {
    if (step === "extracting" && !extractedData) {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: initialText }),
          });
          
          if (!response.ok) throw new Error("Extraction failed");
          
          const data = await response.json();
          
          // Clean up dealbreakers like in AIRequestModal
          if (data.dealbreakers && Array.isArray(data.dealbreakers)) {
            data.dealbreakers = data.dealbreakers.map((db: string | any) => {
              const label = typeof db === 'string' ? db : (db.label || "");
              const cleaned = label.replace(/^(must\s+have|must\s+be|must\s+include|must)\s+/i, "");
              return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            });
          }

          // Clean up preferences too
          if (data.preferences && Array.isArray(data.preferences)) {
            data.preferences = data.preferences.map((p: string | any) => {
              const label = typeof p === 'string' ? p : (p.label || "");
              return label.charAt(0).toUpperCase() + label.slice(1);
            });
          }

          // Add stable IDs for DnD
          data.preferences = (data.preferences || []).map((p: any) => ({ 
            label: String(p), 
            id: `pref-${Math.random().toString(36).slice(2, 9)}`,
            type: 'pref'
          }));
          data.dealbreakers = (data.dealbreakers || []).map((d: any) => ({ 
            label: String(d), 
            id: `deal-${Math.random().toString(36).slice(2, 9)}`,
            type: 'deal'
          }));

          // Ensure budget is handled correctly
          let extractedBudget = data.budget;
          if (typeof extractedBudget === "string") {
            const numeric = parseFloat(extractedBudget.replace(/[^0-9.]/g, ""));
            if (!isNaN(numeric)) extractedBudget = numeric;
          }

          console.log("AI Extraction Result:", data);
          setExtractedData({
            ...data,
            budget: extractedBudget
          });
          
          if (typeof extractedBudget === "number" && extractedBudget > 0) {
            setBudget(extractedBudget);
          }
          
          setStep("summary");
        } catch (err) {
          console.error("Extraction Error:", err);
          setError("AI extraction encountered a minor hiccup. Let's try manually.");
          setExtractedData({
            title: initialText.slice(0, 60),
            description: initialText,
            category: "Other/General",
            condition: "Either",
            budget: "Negotiable",
            preferences: [],
            dealbreakers: []
          });
          setStep("summary");
        }
      }, 1500); // Artificial delay for "magic" feel
      return () => clearTimeout(timer);
    }
  }, [step, extractedData, initialText]);

  const handleFinish = async () => {
    console.log("handleFinish triggered. Step:", step, "User:", user?.id, "Profile Country:", profile?.country);
    
    if (!user) {
      console.log("No user found in handleFinish, setting step to auth");
      setStep("auth");
      return;
    }
    
    // Safety check: ensure we have the data we need
    if (!extractedData) {
      console.error("Attempted to finish without extractedData");
      setError("We lost your request data. Please try again.");
      return;
    }
    
    console.log("Proceeding with submission as user:", user.id);
    setStep("submitting");
    const formData = new FormData();
    formData.set("title", extractedData.title || initialText.slice(0, 50));
    formData.set("description", extractedData.description || initialText);
    formData.set("category", extractedData.category || "Other/General");
    
    // Normalization: Ensure budgetMax is either a valid number string or empty
    const finalBudget = budget !== null ? budget : (typeof extractedData.budget === 'number' ? extractedData.budget : null);
    formData.set("budgetMax", finalBudget ? String(finalBudget) : "");
    
    formData.set("condition", extractedData.condition || "Either");
    formData.set("urgency", urgency || extractedData.urgency || "Standard");
    formData.set("country", profile?.country || "");
    
    // Preferences/Dealbreakers
    const prefs = (extractedData.preferences || []).map((p: any) => ({ label: p.label || p }));
    const deals = (extractedData.dealbreakers || []).map((d: any) => ({ label: d.label || d }));
    
    formData.set("preferences", JSON.stringify(prefs));
    formData.set("dealbreakers", JSON.stringify(deals));

    console.log("Calling createRequestAction with data:", Object.fromEntries(formData.entries()));
    try {
      const res = await createRequestAction(formData);
      console.log("createRequestAction Response:", res);
      
      if (res.error) {
        throw new Error(res.error);
      }
      
      console.log("Request created successfully. Clearing draft.");
      sessionStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["personalized-feed"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      onClose();
      if (res.url) router.push(res.url);
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err instanceof Error ? err.message : "Failed to create request");
      setStep("preview");
    }
  };

  const currentProgress = step === "extracting" ? 15 : step === "summary" ? 30 : step === "budget" ? 50 : step === "urgency" ? 70 : step === "preview" ? 85 : 100;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans overflow-hidden animate-in fade-in duration-500">
      {/* Background soft glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-100 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative w-full py-6 px-8 flex items-center justify-between z-20">
        <button 
          onClick={() => {
            if (step === "extracting") {
              sessionStorage.removeItem(STORAGE_KEY);
              onClose();
            } else {
              setStep("extracting");
            }
          }} 
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-semibold"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        
        <div className="flex-1 max-w-md mx-8">
           <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#6925DC]" 
                initial={{ width: "0%" }}
                animate={{ width: `${currentProgress}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
           </div>
        </div>

        <button 
          onClick={() => setStep("preview")}
          className="px-6 py-2 rounded-lg border border-gray-200 text-green-600 font-semibold hover:bg-gray-50 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 z-10">
        <AnimatePresence mode="wait">
          {step === "extracting" && (
            <motion.div 
              key="extracting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center max-w-2xl"
            >
              <div className="relative mb-12">
                 <div className="absolute inset-0 bg-green-200 blur-[40px] opacity-50 animate-pulse" />
                 <Sparkles className="h-24 w-24 text-green-500 relative animate-bounce" />
              </div>
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                AI is crafting your request...
              </h2>
              <p className="text-xl text-gray-400 font-medium">
                Parsing your intent and matching best categories.
              </p>
            </motion.div>
          )}

        {step === "auth" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            {user ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-expanded)' }}>
                    Just a moment
                  </h2>
                  <p className="text-gray-500 max-w-sm">
                    We're finalizing your request and setting things up.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-expanded)' }}>
                    Final step
                  </h2>
                  <p className="text-gray-500">
                    Create an account to finish posting your request.
                  </p>
                </div>
                
                {authMode === "signup" ? (
                  <SignUpForm 
                    onSuccess={() => {
                      /* handleFinish will trigger via useEffect when user state updates */
                    }} 
                  />
                ) : (
                  <SignInForm 
                  />
                )}

                <button 
                  onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                  className="w-full mt-6 text-sm font-semibold text-gray-500 hover:underline"
                >
                  {authMode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
                </button>
              </div>
            )}
          </motion.div>
        )}

          {step === "summary" && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center text-center w-full max-w-2xl px-4"
            >
              <div className="relative mb-10 w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center">
                 <Check className="h-12 w-12 text-green-500" strokeWidth={3} />
              </div>
              
              <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_42px_100px_rgba(0,0,0,0.08)] border border-gray-100 w-full mb-10 text-left relative overflow-hidden">
                {/* Subtle pattern background for the card */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Sparkles className="w-32 h-32" />
                </div>

                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10 text-center">Summary Card</h3>

                <div className="space-y-10">
                  {/* Category Field */}
                  <div className="space-y-3">
                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                    <div className="relative group">
                      <select 
                        value={extractedData?.category || 'Other/General'}
                        onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                        className="w-full h-16 pl-6 pr-12 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black text-[#6925DC] appearance-none focus:border-[#6925DC] outline-none transition-all cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#6925DC] transition-colors">
                        <ChevronRight className="w-6 h-6 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Title Field */}
                  <div className="space-y-3">
                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">What are you looking for?</label>
                    <div className="relative group">
                      <input 
                        type="text"
                        value={extractedData?.title || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                        className="w-full h-16 pl-6 pr-14 bg-gray-50 border-2 border-gray-100 rounded-2xl text-xl font-black text-black focus:border-[#6925DC] outline-none transition-all"
                        placeholder="Ex: Vintage Rolex Submariner"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#6925DC] transition-colors">
                        <Pencil className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {user?.profile?.country && (
                    <div className="flex items-center gap-3 pl-1 pt-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="text-lg font-bold text-gray-500">
                        Requested in <span className="text-black font-black">{user.profile.country}</span>
                      </p>
                    </div>
                  )}

                  <div className="h-px w-full bg-gray-100 my-4" />

                  {/* Requirements Section */}
                  <div className="space-y-8">
                    {/* Preferences */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Preferences</label>
                        <button
                          onClick={() => setExtractedData({
                            ...extractedData,
                            preferences: [...(extractedData.preferences || []), { label: "New Preference", id: `pref-${Math.random().toString(36).slice(2, 8)}`, type: 'pref' }]
                          })}
                          className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                        >
                          <Plus className="w-5 h-5" strokeWidth={3} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(extractedData?.preferences || []).map((pref: any, idx: number) => (
                          <div key={pref.id || idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-base font-bold group border border-green-100/50">
                            <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const newPrefs = [...extractedData.preferences];
                                newPrefs[idx] = { ...newPrefs[idx], label: e.currentTarget.textContent || "" };
                                setExtractedData({ ...extractedData, preferences: newPrefs });
                              }}
                              className="outline-none min-w-[20px]"
                            >
                              {pref.label}
                            </span>
                            <button
                              onClick={() => {
                                const newPrefs = extractedData.preferences.filter((_: any, i: number) => i !== idx);
                                setExtractedData({ ...extractedData, preferences: newPrefs });
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ml-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dealbreakers */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Dealbreakers</label>
                        <button
                          onClick={() => setExtractedData({
                            ...extractedData,
                            dealbreakers: [...(extractedData.dealbreakers || []), { label: "New Dealbreaker", id: `deal-${Math.random().toString(36).slice(2, 8)}`, type: 'deal' }]
                          })}
                          className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                        >
                          <Plus className="w-5 h-5" strokeWidth={3} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(extractedData?.dealbreakers || []).map((deal: any, idx: number) => (
                          <div key={deal.id || idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-base font-bold group border border-amber-100/50">
                            <X className="h-4 w-4 shrink-0" strokeWidth={3} />
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const newDeals = [...extractedData.dealbreakers];
                                newDeals[idx] = { ...newDeals[idx], label: e.currentTarget.textContent || "" };
                                setExtractedData({ ...extractedData, dealbreakers: newDeals });
                              }}
                              className="outline-none min-w-[20px]"
                            >
                              {deal.label}
                            </span>
                            <button
                              onClick={() => {
                                const newDeals = extractedData.dealbreakers.filter((_: any, i: number) => i !== idx);
                                setExtractedData({ ...extractedData, dealbreakers: newDeals });
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all ml-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100 my-10" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Everything looks correct?</p>
              </div>

              <div className="flex justify-center w-full max-w-md pb-12">
                 <Button 
                   onClick={() => {
                     // Determine where to go next based on missing data
                     const hasValidBudget = (budget !== null && budget > 0) || (typeof extractedData?.budget === "number" && extractedData.budget > 0);
                     if (!hasValidBudget && extractedData?.budget !== "Negotiable") {
                        setStep("budget");
                     } else if (!urgency && !extractedData?.urgency) {
                        setStep("urgency");
                     } else {
                        handleFinish();
                     }
                   }}
                   size="lg"
                   className="w-full h-20 rounded-2xl bg-black text-white hover:bg-black/90 text-2xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:scale-[1.02] flex items-center justify-center gap-4 group"
                 >
                   <span>Launch Request</span>
                   <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                 </Button>
              </div>
            </motion.div>
          )}

          {step === "budget" && (
            <motion.div 
              key="budget"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center text-center w-full max-w-3xl"
            >
              <h2 className="text-5xl font-extrabold mb-4 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                What is your budget?
              </h2>
              <p className="text-lg text-gray-400 font-medium mb-12">
                We&apos;ll estimate market rates for your request to guide sellers.
              </p>
              
              <div className="relative w-full max-w-md mb-12">
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-300">$</span>
                 <input 
                   type="number"
                   autoFocus
                   placeholder="Enter amount"
                   className="w-full h-24 bg-gray-50 border-2 border-gray-100 rounded-2xl px-14 text-4xl font-bold outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300"
                   onChange={(e) => setBudget(Number(e.target.value))}
                   onKeyDown={(e) => e.key === "Enter" && setStep("urgency")}
                 />
              </div>

              <Button 
                onClick={() => setStep("urgency")}
                size="lg"
                className="h-16 px-12 rounded-2xl bg-black text-white hover:bg-black/90 text-lg font-bold shadow-2xl transition-all"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {step === "urgency" && (
            <motion.div 
              key="urgency"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center text-center w-full max-w-4xl"
            >
              <h2 className="text-5xl font-extrabold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                How soon do you need help?
              </h2>
              <p className="text-lg text-gray-400 font-medium mb-12">
                We&apos;ll notify sellers based on your deadline requirements.
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                 {[
                   { id: "Now", label: "Now", icon: <Sparkles className="h-5 w-5" /> },
                   { id: "Standard", label: "In 1-2 weeks", icon: <Calendar className="h-5 w-5" /> },
                   { id: "No Rush", label: "No Rush", icon: <Check className="h-5 w-5" /> }
                 ].map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => {
                        setUrgency(opt.id);
                        setStep("preview");
                     }}
                     className={cn(
                       "group flex items-center gap-4 px-10 py-6 rounded-2xl border-2 transition-all duration-300",
                       urgency === opt.id 
                        ? "border-black bg-black text-white scale-105 shadow-xl" 
                        : "border-gray-100 bg-gray-50 text-gray-600 hover:border-black/20 hover:scale-[1.02]"
                     )}
                   >
                     <span className="text-2xl font-bold">{opt.label}</span>
                   </button>
                 ))}
              </div>
            </motion.div>
          )}

          {step === "preview" && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center w-full max-w-4xl"
            >
              {user ? (
                <div className="flex flex-col items-center gap-6 py-20">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: 'var(--font-expanded)' }}>
                      Finalizing your request
                    </h2>
                    <p className="text-lg text-gray-500 max-w-sm mx-auto">
                      Everything's set! We're publishing your request to the marketplace.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-[42px] font-extrabold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                    Review your request
                  </h2>
                  <p className="text-lg text-gray-400 font-medium mb-12">
                    We&apos;ve generated this draft based on your intent. Landing in the marketplace soon.
                  </p>
                </>
              )}
              
              {!user && (
                <>
                  <div className="w-full max-w-lg mb-16 relative">
                    {/* Decorative glow behind the card */}
                    <div className="absolute inset-x-0 inset-y-8 bg-[#6925DC]/5 blur-[60px] rounded-full pointer-events-none" />
                    
                    <div className={cn(
                      "relative transform transition-all duration-300 p-[6px] rounded-[20px] shadow-none",
                      getRequestTheme(extractedData?.category).bg
                    )}>
                      <RequestCard 
                        request={{
                          id: "preview",
                          user_id: user?.id || "guest",
                          title: extractedData?.title || initialText.slice(0, 60),
                          slug: "preview",
                          description: `${extractedData?.description || initialText}\n\n<!--REQUEST_PREFS:${JSON.stringify({
                            priceLock: "open",
                            exactItem: false,
                            exactSpecification: false,
                            exactPrice: false,
                            preferences: extractedData?.preferences || [],
                            dealbreakers: extractedData?.dealbreakers || [],
                          })}-->`,
                          category: extractedData?.category || "Other",
                          budget_min: null,
                          budget_max: budget || extractedData?.budget || null,
                          country: profile?.country || null,
                          condition: extractedData?.condition || "Either",
                          urgency: urgency || extractedData?.urgency || "Standard",
                          status: "pending",
                          winner_submission_id: null,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          submissionCount: 0,
                          profiles: {
                            username: profile?.username || "guest"
                          }
                        } as any}
                        variant="detail"
                        smallImages={true}
                        isPreview={true}
                        disableHover={true}
                        showAllRequirements={true}
                        onUpdateTitle={(newTitle) => setExtractedData({ ...extractedData, title: newTitle })}
                        onUpdateRequirement={(idx, newLabel) => {
                          const prefs = extractedData?.preferences || [];
                          const deals = extractedData?.dealbreakers || [];
                          if (idx < prefs.length) {
                            const newPrefs = [...prefs];
                            newPrefs[idx] = { ...newPrefs[idx], label: newLabel };
                            setExtractedData({ ...extractedData, preferences: newPrefs });
                          } else {
                            const newDeals = [...deals];
                            const dealIdx = idx - prefs.length;
                            newDeals[dealIdx] = { ...newDeals[dealIdx], label: newLabel };
                            setExtractedData({ ...extractedData, dealbreakers: newDeals });
                          }
                        }}
                        onReorderRequirements={(newItems) => {
                          const newPrefs = newItems.filter(i => i.type === 'pref').map(i => ({ label: i.label, id: i.id }));
                          const newDeals = newItems.filter(i => i.type === 'deal').map(i => ({ label: i.label, id: i.id }));
                          setExtractedData({ ...extractedData, preferences: newPrefs, dealbreakers: newDeals });
                        }}
                        onEditField={(field) => setEditingField(field)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <button 
                      onClick={() => {
                        sessionStorage.removeItem(STORAGE_KEY);
                        onClose();
                      }}
                      className="text-gray-400 hover:text-black font-bold transition-colors text-lg"
                    >
                      Discard
                    </button>
                    <Button 
                      onClick={handleFinish}
                      size="lg"
                      className="h-20 px-16 rounded-2xl bg-black text-white hover:bg-black/90 text-2xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:scale-[1.02] flex items-center gap-4 group"
                    >
                      <span>Launch Request</span>
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === "auth" && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-center max-w-5xl w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch w-full">
                {/* Left side: Auth Form */}
                <div className="space-y-8 bg-white p-12 rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.06)] border border-gray-100">
                  <div className="text-left mb-4">
                    <h2 className="text-4xl font-extrabold text-black mb-3 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Almost there!</h2>
                    <p className="text-lg text-gray-500 font-medium">
                      <span className="text-green-600 font-bold">Your request is ready to launch.</span> Sign in to publish it and start receiving offers.
                    </p>
                  </div>

                  {authMode === 'signup' ? (
                    <div className="space-y-8">
                       <SignUpForm onSuccess={() => handleFinish()} />
                       <p className="text-lg text-center text-gray-400 font-medium">
                         Already using Onseek?{" "}
                         <button onClick={() => setAuthMode('login')} className="text-[#6925DC] font-bold hover:underline transition-all">
                           Log in
                         </button>
                       </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                       <SignInForm onSuccess={() => handleFinish()} />
                       <p className="text-lg text-center text-gray-400 font-medium">
                         Don&apos;t have an account?{" "}
                         <button onClick={() => setAuthMode('signup')} className="text-[#6925DC] font-bold hover:underline transition-all">
                           Sign up
                         </button>
                       </p>
                    </div>
                  )}
                </div>

                {/* Right side: Social Proof / Perks */}
                <div className="flex flex-col justify-center bg-gray-50/50 p-12 rounded-[2.5rem] border border-gray-100">
                   <h3 className="text-2xl font-extrabold mb-10 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Join the community</h3>
                   
                   <div className="space-y-8">
                     {[
                       { icon: <ShieldCheck className="h-6 w-6 text-green-500" />, title: "Verified Sellers", desc: "Buy with confidence from vetted professionals globally." },
                       { icon: <Sparkles className="h-6 w-6 text-[#6925DC]" />, title: "Private Matches", desc: "Get exclusive data-driven offers for your specific request." },
                       { icon: <LockKeyhole className="h-6 w-6 text-orange-500" />, title: "Secure Deals", desc: "Your data and payments are always protected end-to-end." },
                       { icon: <Crown className="h-6 w-6 text-yellow-500" />, title: "Premium Access", desc: "First-look at rare items before they ever hit the public feed." }
                     ].map((perk, idx) => (
                       <div key={idx} className="flex gap-6 items-start">
                         <div className="shrink-0 p-3 bg-white rounded-2xl shadow-sm border border-gray-50">{perk.icon}</div>
                         <div>
                            <p className="font-extrabold text-black text-lg mb-1" style={{ fontFamily: 'var(--font-expanded)' }}>{perk.title}</p>
                            <p className="text-gray-500 font-medium leading-relaxed">{perk.desc}</p>
                         </div>
                       </div>
                     ))}
                   </div>

                   <div className="mt-auto pt-12 border-t border-gray-100 flex items-center gap-6">
                      <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-xl transition-transform hover:scale-110 hover:z-10 bg-cover" 
                               style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=user${i + 40})` }} />
                        ))}
                      </div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">Joined by 50,000+ members</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "submitting" && (
            <motion.div 
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <Loader2 className="h-16 w-16 animate-spin text-black mb-8" />
              <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                Publishing to marketplace...
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <div className="relative py-8 px-12 flex justify-center z-20">
         <span className="text-sm font-bold tracking-widest text-gray-300 uppercase" style={{ fontFamily: 'var(--font-expanded)' }}>
           Onseek AI Engine v1.0
         </span>
      </div>

      {/* Inline Edit Dialog */}
      <AnimatePresence>
        {editingField && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingField(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-10 shadow-3xl overflow-hidden"
            >
              <h3 className="text-2xl font-black mb-6 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                Edit {editingField.charAt(0).toUpperCase() + editingField.slice(1)}
              </h3>

              {editingField === 'category' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setExtractedData({ ...extractedData, category: cat });
                        setEditingField(null);
                      }}
                      className={cn(
                        "text-left px-5 py-4 rounded-xl border-2 font-bold transition-all text-[15px] flex items-center justify-between",
                        (extractedData?.category || 'Other/General') === cat 
                          ? "border-black bg-black text-white" 
                          : "border-gray-100 bg-gray-50 text-gray-600 hover:border-black/20"
                      )}
                    >
                      <span>{cat}</span>
                      {(extractedData?.category || 'Other/General') === cat && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}

              {editingField === 'title' && (
                <div className="space-y-6">
                  <textarea 
                    autoFocus
                    className="w-full min-h-[120px] p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg font-semibold focus:border-black outline-none resize-none transition-all"
                    defaultValue={extractedData?.title || initialText.slice(0, 60)}
                    onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                  />
                </div>
              )}

              {editingField === 'budget' && (
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">$</span>
                  <input 
                    type="number"
                    autoFocus
                    placeholder="Enter budget"
                    className="w-full h-20 bg-gray-50 border-2 border-gray-100 rounded-2xl px-12 text-2xl font-bold outline-none focus:border-black transition-all"
                    defaultValue={budget || extractedData?.budget || ""}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                </div>
              )}

              {editingField === 'condition' && (
                <div className="flex flex-col gap-3">
                  {['New', 'Used', 'Either'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setExtractedData({ ...extractedData, condition: c });
                        setEditingField(null);
                      }}
                      className={cn(
                        "w-full py-4 px-6 rounded-xl border-2 font-bold transition-all text-left",
                        (extractedData?.condition || 'Either') === c ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-10 flex gap-4">
                <Button 
                  onClick={() => setEditingField(null)}
                  className="flex-1 h-16 rounded-2xl bg-black text-white font-bold text-lg"
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

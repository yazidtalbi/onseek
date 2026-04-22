"use client";

import * as React from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { X, ChevronLeft, Sparkles, Loader2, ArrowRight, Check, Plus, DollarSign, Calendar, Target, Store, MessageCircle, ShieldCheck, Crown, LockKeyhole, Pencil, ChevronRight, MapPin, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem } from "@/lib/types";
import { createRequestAction } from "@/actions/request.actions";
import { useQueryClient } from "@tanstack/react-query";
import { getRequestTheme } from "@/lib/utils/request-themes";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { CATEGORIES } from "@/lib/gemini";
import { useToast } from "@/components/ui/use-toast";

interface AIRequestFlowProps {
  initialText: string;
  onClose: () => void;
  user: any;
  profile: any;
}

type FlowStep = "extracting" | "budget" | "condition" | "urgency" | "summary" | "auth" | "submitting";

interface DraggableRequirementItemProps {
  item: any;
  onBlur: (newLabel: string) => void;
  onDelete: () => void;
  isPreference?: boolean;
}

function DraggableRequirementItem({ item, onBlur, onDelete, isPreference }: DraggableRequirementItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      className="flex items-center gap-4 py-4 group/item relative bg-white"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="h-8 w-8 -ml-2 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-lg transition-colors group/handle shrink-0"
      >
        <GripVertical className="h-5 w-5 text-gray-300 opacity-0 group-hover/handle:opacity-100 transition-opacity" />
      </div>

      {isPreference ? (
        <Check className="h-5 w-5 text-green-500 shrink-0" strokeWidth={3} />
      ) : (
        <X className="h-5 w-5 text-gray-400 shrink-0" strokeWidth={3} />
      )}

      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onBlur(e.currentTarget.textContent || "")}
        className={cn(
          "flex-1 outline-none text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight",
          isPreference ? "text-[#1A1A1A]" : "text-gray-400"
        )}
      >
        {item.label}
      </span>

      <button
        onClick={onDelete}
        className="opacity-0 group-hover/item:opacity-100 hover:text-red-500 transition-all text-gray-300"
      >
        <X className="h-5 w-5" />
      </button>
    </Reorder.Item>
  );
}

export function AIRequestFlow({ initialText, onClose, user, profile }: AIRequestFlowProps) {
  const STORAGE_KEY = "onseek_ai_draft";

  const getSavedDraft = () => {
    if (typeof window === 'undefined') return null;
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  };

  const savedDraft = getSavedDraft();

  // Detect if this is a fresh start with new text or a restore
  const isNewText = React.useMemo(() => {
    return initialText && initialText !== savedDraft?.initialText;
  }, [initialText, savedDraft?.initialText]);
  const [showSkipConfirm, setShowSkipConfirm] = React.useState(false);
  const [step, setStep] = React.useState<FlowStep>(() => {
    if (isNewText) return "extracting";
    if (savedDraft) {
      if (savedDraft.step === "auth" && user) return "auth";
      return savedDraft.step || "extracting";
    }
    return "extracting";
  });
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("signup");
  const [extractedData, setExtractedData] = React.useState<any>(() => {
    return isNewText ? null : (savedDraft?.extractedData || null);
  });
  const [urgency, setUrgency] = React.useState<string | null>(() => {
    return isNewText ? null : (savedDraft?.urgency || null);
  });
  const [budget, setBudget] = React.useState<number | null>(() => {
    return isNewText ? null : (savedDraft?.budget || null);
  });
  const [error, setError] = React.useState<string | null>(null);
  const [editingField, setEditingField] = React.useState<'title' | 'condition' | 'budget' | 'preferences' | 'dealbreakers' | 'images' | 'category' | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  // Restore persistence and lock scroll on mount
  React.useEffect(() => {
    // Lock scroll on both html and body to be safe across browsers
    const html = document.documentElement;
    const { body } = document;

    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const originalHtmlHeight = html.style.height;
    const originalBodyHeight = body.style.height;

    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";

    return () => {
      html.style.overflow = originalHtmlOverflow;
      html.style.height = originalHtmlHeight;
      body.style.overflow = originalBodyOverflow;
      body.style.height = originalBodyHeight;
    };
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
    if ((step === "auth" || step === "summary") && user && profile && extractedData) {
      console.log("Auto-submitting draft due to auth success...");
      handleFinish();
    }
  }, [step, user, profile, extractedData]);
  React.useEffect(() => {
    // ONLY extract if we don't have existing extracted data OR if initialText has changed from the draft
    const shouldExtract = step === "extracting" && (
      !extractedData || 
      (initialText && initialText !== savedDraft?.initialText)
    );

    if (shouldExtract) {
      const timer = setTimeout(async () => {
        try {
          const response = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: initialText }),
          });

          if (!response.ok) {
            if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
            throw new Error("EXTRACTION_FAILED");
          }

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
        } catch (err: any) {
          console.error("Extraction Error:", err);

          if (err.message === "QUOTA_EXCEEDED") {
            toast({
              title: "AI is at capacity",
              description: "We'll continue with a manual setup for now.",
            });
          } else if (err.message?.includes("503") || err.status === 503) {
            toast({
              title: "AI is briefly unavailable",
              description: "The service is under high demand. Let's finish this manually for now!",
            });
          } else {
            toast({
              title: "Extraction hit a snag",
              description: "AI had a minor hiccup. Let's finish this manually!",
            });
          }
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
  }, [step, extractedData, initialText, savedDraft?.initialText]);

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
    
    if (extractedData.tags && Array.isArray(extractedData.tags)) {
      formData.set("tags", JSON.stringify(extractedData.tags));
    }

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
      // Use window.location.assign instead of router.push to bypass Next.js intercepting routes
      // and go straight to the full page instead of opening a modal.
      if (res.url) {
        window.location.assign(res.url);
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err instanceof Error ? err.message : "Failed to create request");
      setStep("summary");
    }
  };

  const currentProgress = step === "extracting" ? 10 : step === "budget" ? 25 : step === "condition" ? 40 : step === "urgency" ? 60 : step === "summary" ? 85 : 100;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans overflow-y-auto overflow-x-hidden animate-in fade-in duration-500">
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
            } else if (step === "budget") {
              setStep("extracting");
            } else if (step === "condition") {
              setStep("budget");
            } else if (step === "urgency") {
              setStep("condition");
            } else if (step === "summary") {
              setStep("urgency");
            } else {
              setStep("summary");
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

        <Dialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
          <DialogTrigger asChild>
            <button
              className="px-6 py-2 rounded-full border border-[#7755FF] text-[#7755FF] font-semibold hover:bg-[#7755FF]/5 transition-all active:scale-95"
            >
              Skip
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'var(--font-expanded)' }}>Skip AI Extraction?</DialogTitle>
              <DialogDescription className="pt-2">
                By skipping, we won't be able to automatically analyze and structure your request. You'll need to fill in the missing details manually.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowSkipConfirm(false);
                  setStep("summary");
                }}
                className="px-4 py-2 rounded-full bg-[#7755FF] text-white font-semibold hover:bg-[#6644ee] transition-colors"
              >
                Yes, Skip
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col items-center px-6 z-10 py-12">
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
               {!user && (
                <div className="w-full max-w-5xl">
                   {/* This is handled by the auth grid below now */}
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
              <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_42px_100px_rgba(0,0,0,0.08)] border border-gray-100 w-full mb-10 text-left relative overflow-hidden">

                <h3 className="text-2xl font-black text-black tracking-tight mb-10 text-center" style={{ fontFamily: 'var(--font-expanded)' }}>Ready to launch?</h3>

                <div className="space-y-10">
                  {/* Category Field */}
                  <div className="space-y-3">
                    <label className="text-lg font-semibold text-gray-400 pl-1" style={{ fontFamily: 'var(--font-expanded)' }}>Category</label>
                    <div className="relative group">
                      <select
                        value={extractedData?.category || 'Other/General'}
                        onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                        className="w-full h-16 pl-6 pr-12 bg-gray-50 border-2 border-gray-100 rounded-2xl text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A] appearance-none focus:border-[#6925DC] outline-none transition-all cursor-pointer"
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
                    <label className="text-lg font-semibold text-gray-400 pl-1" style={{ fontFamily: 'var(--font-expanded)' }}>What are you looking for?</label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={extractedData?.title || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                        className="w-full h-16 pl-6 pr-14 bg-gray-50 border-2 border-gray-100 rounded-2xl text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A] focus:border-[#6925DC] outline-none transition-all"
                        style={{ fontFamily: 'var(--font-expanded)' }}
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#6925DC] transition-colors">
                        <Pencil className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Budget & Condition Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3 font-[var(--font-sans)]">
                      <label className="text-lg font-semibold text-gray-400 pl-1" style={{ fontFamily: 'var(--font-expanded)' }}>Budget</label>
                      <div
                        className="w-full h-16 flex items-center px-6 bg-gray-50 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-black/10 transition-all"
                        onClick={() => setStep("budget")}
                      >
                        <span className="text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]">
                          {budget ? `$${budget}` : extractedData?.budget || "Negotiable"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-lg font-semibold text-gray-400 pl-1" style={{ fontFamily: 'var(--font-expanded)' }}>Condition</label>
                      <div
                        className="w-full h-16 flex items-center px-6 bg-gray-50 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-black/10 transition-all"
                        onClick={() => setStep("condition")}
                      >
                        <span className="text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]">
                          {extractedData?.condition || "Either"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-100 my-4" />

                  {/* Requirements Section */}
                  <div className="space-y-10">
                    {/* Preferences */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-lg font-semibold text-gray-400" style={{ fontFamily: 'var(--font-expanded)' }}>Preferences</label>
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

                      <Reorder.Group
                        axis="y"
                        values={extractedData?.preferences || []}
                        onReorder={(newOrder) => setExtractedData({ ...extractedData, preferences: newOrder })}
                        className="flex flex-col border-t border-gray-100 -mx-4 px-4 divide-y divide-gray-100"
                      >
                        {(extractedData?.preferences || []).map((pref: any) => (
                          <DraggableRequirementItem
                            key={pref.id}
                            item={pref}
                            isPreference
                            onBlur={(newLabel) => {
                              const newPrefs = extractedData.preferences.map((p: any) =>
                                p.id === pref.id ? { ...p, label: newLabel } : p
                              );
                              setExtractedData({ ...extractedData, preferences: newPrefs });
                            }}
                            onDelete={() => {
                              const newPrefs = extractedData.preferences.filter((p: any) => p.id !== pref.id);
                              setExtractedData({ ...extractedData, preferences: newPrefs });
                            }}
                          />
                        ))}
                      </Reorder.Group>
                    </div>

                    {/* Dealbreakers */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-lg font-semibold text-gray-400" style={{ fontFamily: 'var(--font-expanded)' }}>Dealbreakers</label>
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

                      <Reorder.Group
                        axis="y"
                        values={extractedData?.dealbreakers || []}
                        onReorder={(newOrder) => setExtractedData({ ...extractedData, dealbreakers: newOrder })}
                        className="flex flex-col border-t border-gray-100 -mx-4 px-4 divide-y divide-gray-100"
                      >
                        {(extractedData?.dealbreakers || []).map((deal: any) => (
                          <DraggableRequirementItem
                            key={deal.id}
                            item={deal}
                            onBlur={(newLabel) => {
                              const newDeals = extractedData.dealbreakers.map((d: any) =>
                                d.id === deal.id ? { ...d, label: newLabel } : d
                              );
                              setExtractedData({ ...extractedData, dealbreakers: newDeals });
                            }}
                            onDelete={() => {
                              const newDeals = extractedData.dealbreakers.filter((d: any) => d.id !== deal.id);
                              setExtractedData({ ...extractedData, dealbreakers: newDeals });
                            }}
                          />
                        ))}
                      </Reorder.Group>
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-4">
                    <label className="text-lg font-semibold text-gray-400 pl-1" style={{ fontFamily: 'var(--font-expanded)' }}>Automated Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {(extractedData?.tags || []).map((tag: string, idx: number) => (
                        <div
                          key={idx}
                          className="bg-[#1A1A1A] text-white border border-[#1A1A1A] text-[12px] uppercase tracking-widest px-3 py-1 rounded-none font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-default"
                        >
                          #{tag.replace(/\s+/g, '-').toLowerCase()}
                        </div>
                      ))}
                    </div>
                    <p className="text-[12px] text-gray-400 font-medium pl-1">
                      AI-generated tags for better seller matching and SEO.
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100 my-10" />
              </div>


              <div className="flex justify-center w-full max-w-md pb-12">
                <Button
                  onClick={handleFinish}
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
                  onKeyDown={(e) => e.key === "Enter" && setStep("condition")}
                />
              </div>

              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <Button
                  onClick={() => {
                    setStep("condition");
                  }}
                  size="lg"
                  className="h-16 px-12 rounded-2xl bg-black text-white hover:bg-black/90 text-lg font-bold shadow-2xl transition-all w-full"
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <button
                  onClick={() => {
                    setExtractedData({ ...extractedData, budget: "Negotiable" });
                    setBudget(null);
                    setStep("condition");
                  }}
                  className="text-gray-400 hover:text-black font-bold transition-colors"
                >
                  My budget is negotiable
                </button>
              </div>
            </motion.div>
          )}

          {step === "condition" && (
            <motion.div
              key="condition"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center text-center w-full max-w-4xl"
            >
              <h2 className="text-5xl font-extrabold mb-4 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                What is the condition?
              </h2>
              <p className="text-lg text-gray-400 font-medium mb-12">
                Help sellers know exactly what you are looking for.
              </p>

              <div className="flex flex-wrap justify-center gap-6 mb-16">
                {[
                  { id: "New", label: "New", desc: "Brand new, never used" },
                  { id: "Used", label: "Used", desc: "Pre-owned, good condition" },
                  { id: "Either", label: "Either", desc: "Both new and used are fine" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setExtractedData({ ...extractedData, condition: opt.id });
                      setStep("urgency");
                    }}
                    className={cn(
                      "group flex flex-col items-center gap-3 px-10 py-8 rounded-2xl border-2 transition-all duration-300 w-64",
                      extractedData?.condition === opt.id
                        ? "border-black bg-black text-white scale-105 shadow-xl"
                        : "border-gray-100 bg-gray-50 text-gray-600 hover:border-black/20 hover:scale-[1.02]"
                    )}
                  >
                    <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-expanded)' }}>{opt.id}</span>
                    <span className={cn(
                      "text-sm font-medium opacity-60",
                      extractedData?.condition === opt.id ? "text-white" : "text-gray-500"
                    )}>{opt.desc}</span>
                  </button>
                ))}
              </div>
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
                      setStep("summary");
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


          {step === "auth" && !user && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full flex-1 flex flex-col items-center justify-center p-6"
            >
              <div className="max-w-[880px] w-full bg-white rounded-[1.5rem] overflow-hidden">
                <div className="p-6 w-full">
                  <div className="flex flex-col md:flex-row gap-10 lg:gap-14 items-stretch w-full">
                    {/* Left column: Forms */}
                    <div className="w-full md:w-[380px] shrink-0 flex flex-col justify-center text-left">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-expanded)' }}>Almost there!</h2>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-[320px]">
                          <span className="text-green-600 font-bold">Your request is ready to launch.</span> Sign in to publish it and start receiving offers.
                        </p>
                      </div>
                      
                      <div className="w-full">
                        {authMode === 'signup' ? (
                          <div className="space-y-6">
                            <SignUpForm onSuccess={() => handleFinish()} />
                            <p className="text-sm text-center text-gray-500">
                              Already using Onseek?{" "}
                              <button onClick={() => setAuthMode('login')} className="text-[#7755FF] font-semibold hover:underline">
                                Log in
                              </button>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <SignInForm onSuccess={() => handleFinish()} />
                            <p className="text-sm text-center text-gray-500">
                              Don&apos;t have an account?{" "}
                              <button onClick={() => setAuthMode('signup')} className="text-[#7755FF] font-semibold hover:underline">
                                Sign up
                              </button>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right column: Perks Section */}
                    <div className="hidden md:flex flex-1 min-w-0">
                      <div className="p-10 rounded-[1.5rem] bg-gray-50 h-full flex flex-col justify-center">
                        <div className="mb-8 flex items-center gap-3">
                          <h3 className="text-lg lg:text-xl font-semibold text-[#222234]" style={{ fontFamily: 'var(--font-expanded)' }}>Join the community</h3>
                        </div>

                        <div className="space-y-6">
                          {[
                            { icon: <Target className="h-5 w-5 text-[#7755FF]" />, title: "Smart Requests", desc: "Broadcast your needs. Post detailed requests and let the marketplace come to you." },
                            { icon: <Sparkles className="h-5 w-5 text-yellow-500" />, title: "Live Proposals", desc: "Get notified instantly. Receive tailored offers from professionals as soon as they’re submitted." },
                            { icon: <Store className="h-5 w-5 text-green-500" />, title: "Personal Inventory", desc: "Your global storefront. List items or services in a dedicated space accessible to the entire community." },
                            { icon: <MessageCircle className="h-5 w-5 text-[#222234]" />, title: "Direct Messaging", desc: "Close the deal. Engage in private, secure conversations to negotiate and finalize details." }
                          ].map((perk, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="shrink-0 mt-0.5">{perk.icon}</div>
                              <div>
                                <p className="font-semibold text-[#222234] text-sm mb-0.5" style={{ fontFamily: 'var(--font-expanded)' }}>{perk.title}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{perk.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-12 flex items-center gap-4">
                          <div className="flex -space-x-3 items-center">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-10 bg-cover bg-center"
                                style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=user${i + 20})` }} />
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#7755FF] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+</div>
                          </div>
                          <p className="text-xs text-gray-400 font-medium tracking-tight uppercase leading-none">Join a whole community</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

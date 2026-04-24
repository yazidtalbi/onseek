"use client";

import * as React from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { X, ChevronLeft, Sparkles, Loader2, ArrowRight, Check, Plus, DollarSign, Calendar, Target, Store, MessageCircle, ShieldCheck, Crown, LockKeyhole, Pencil, ChevronRight, MapPin, GripVertical, Settings2 } from "lucide-react";
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

type FlowStep = "input" | "extracting" | "budget" | "condition" | "urgency" | "summary" | "auth" | "submitting";

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
      className="flex items-center gap-3 py-4 group/item relative bg-white"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        className="h-8 w-8 -ml-2 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-lg transition-colors group/handle shrink-0"
      >
        <GripVertical className="h-5 w-5 text-gray-300 transition-opacity" />
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
        className="hover:text-red-500 transition-all text-gray-300 px-1"
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
  const [inputText, setInputText] = React.useState(initialText || (savedDraft?.initialText || ""));
  const [step, setStep] = React.useState<FlowStep>(() => {
    if (isNewText) return "extracting";
    if (savedDraft) {
      if (savedDraft.step === "auth" && user) return "auth";
      return savedDraft.step || "extracting";
    }
    return initialText ? "extracting" : "input";
  });
  const [authMode, setAuthMode] = React.useState<"login" | "signup">("signup");
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = React.useState(false);

  // Handle extraction timeout
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "extracting") {
      setShowTimeoutMessage(false);
      timer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 20000); // 20 seconds
    } else {
      setShowTimeoutMessage(false);
    }
    return () => clearTimeout(timer);
  }, [step]);
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
  const [newTag, setNewTag] = React.useState("");
  const [isAddingTag, setIsAddingTag] = React.useState(false);
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
    // 1. In 'auth' step (came from registration or was ready to post)
    // 2. We have user AND profile (onboarding finished)
    // 3. We have restored extractedData
    if (step === "auth" && user && profile && extractedData) {
      console.log("Auto-submitting draft due to auth success...");
      handleFinish();
    }
  }, [step, user, profile, extractedData]);
  React.useEffect(() => {
    // ONLY extract if we don't have existing extracted data OR if initialText has changed from the draft
    const shouldExtract = step === "extracting" && (
      !extractedData ||
      (inputText && inputText !== savedDraft?.initialText)
    );

    if (step === "extracting" && !shouldExtract && extractedData) {
      setStep("summary");
      return;
    }

    if (shouldExtract) {
      const timer = setTimeout(async () => {
        try {
          console.log("Starting AI Extraction for text:", inputText);
          const response = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: inputText }),
          });

          console.log("Extraction API response status:", response.status);

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
            title: inputText.slice(0, 60),
            description: inputText,
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
  }, [step, extractedData, inputText, savedDraft?.initialText]);

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
    formData.set("title", extractedData.title || inputText.slice(0, 50));
    formData.set("description", extractedData.description || inputText);
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

  const currentProgress = step === "input" ? 5 : step === "extracting" ? 15 : step === "budget" ? 30 : step === "condition" ? 45 : step === "urgency" ? 65 : step === "summary" ? 90 : 100;

  const NO_CONDITION_CATEGORIES = [
    "Services",
    "Finance",
    "Grocery",
    "Travel",
    "Digital",
    "Experiences",
    "Learning"
  ];

  const shouldHideCondition = React.useMemo(() => {
    return NO_CONDITION_CATEGORIES.includes(extractedData?.category || "");
  }, [extractedData?.category]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans overflow-y-auto overflow-x-hidden animate-in fade-in duration-500">
      {/* Background soft glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative w-full py-6 px-8 flex items-center justify-between z-20">
        <button
          onClick={() => {
            if (step === "input" || step === "extracting") {
              sessionStorage.removeItem(STORAGE_KEY);
              onClose();
            } else if (step === "budget") {
              setStep("extracting");
            } else if (step === "condition") {
              setStep("budget");
            } else if (step === "urgency") {
              if (shouldHideCondition) {
                setStep("budget");
              } else {
                setStep("condition");
              }
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
              className="px-6 py-2 rounded-full border border-gray-200 text-gray-400 font-semibold hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-md rounded-[2.5rem] z-[10001]"
            overlayClassName="z-[10000]"
          >
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'var(--font-expanded)' }}>Dismiss Request?</DialogTitle>
              <DialogDescription className="pt-2">
                Are you sure you want to exit? Your progress will be lost and your request won&apos;t be published.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-6">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setShowSkipConfirm(false);
                  sessionStorage.removeItem(STORAGE_KEY);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Yes, Dismiss
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Area */}
      <main className="relative flex-1 flex flex-col items-center px-6 z-10 py-12">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl space-y-12"
            >
              <div className="space-y-6 text-center">
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-[#6925DC]/5 flex items-center justify-center relative">
                    <Sparkles className="w-12 h-12 text-[#6925DC]" />
                    <motion.div
                      className="absolute inset-0 bg-[#6925DC]/10 rounded-3xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tight leading-[1.1]" style={{ fontFamily: 'var(--font-expanded)' }}>
                  What are you <br /> looking for?
                </h1>
                <p className="text-lg md:text-xl text-gray-400 font-medium max-w-lg mx-auto">
                  Describe your perfect item and watch as our AI structures everything for you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <textarea
                    autoFocus
                    placeholder="Example: I'm looking for a vintage Rolex Submariner from the 70s, ideally with a ghost bezel. Must be in original condition. My budget is around $15,000."
                    className="w-full min-h-[220px] bg-white border-2 border-gray-100 focus:border-black rounded-[2.5rem] p-10 text-xl md:text-2xl font-semibold resize-none placeholder:text-gray-200 shadow-none transition-all duration-300 outline-none leading-relaxed"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="absolute bottom-6 right-8 text-xs font-bold tracking-widest uppercase text-gray-300">
                    {inputText.trim().length} characters
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <Button
                    onClick={() => {
                      if (inputText.trim().length >= 10) setStep("extracting");
                    }}
                    disabled={inputText.trim().length < 10}
                    className="w-full h-20 md:h-24 rounded-full bg-black text-white hover:bg-black/90 text-xl md:text-3xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all hover:scale-[1.01] flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <span>Generate Request</span>
                    <ArrowRight className="h-6 w-6 md:h-8 md:w-8 transition-transform group-hover:translate-x-2" />
                  </Button>

                  {inputText.trim().length > 0 && inputText.trim().length < 10 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 font-bold text-sm uppercase tracking-widest"
                    >
                      Please describe a bit more (10+ chars)
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === "extracting" && (
            <motion.div
              key="extracting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto"
            >
              <div className="w-full h-[600px] overflow-hidden relative p-8 sm:p-16">
                <DictionaryHighlight text={inputText} />
              </div>

              <AnimatePresence>
                {showTimeoutMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 text-gray-400 font-medium text-sm md:text-base animate-pulse"
                  >
                    It&apos;s taking too long, please wait..
                  </motion.div>
                )}
              </AnimatePresence>
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
              className="flex flex-col items-center w-full max-w-2xl px-2 sm:px-4"
            >
              <div className="text-center mb-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-[#6925DC]/10 flex items-center justify-center mb-6 text-[#6925DC]">
                  <Sparkles className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <h3
                  className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-3"
                  style={{ fontFamily: '"Zalando Sans SemiExpanded", sans-serif', fontWeight: 600, letterSpacing: "-0.02em" }}
                >
                  Review your request
                </h3>
                <p className="text-gray-400 font-medium text-[15px] sm:text-lg">
                  Take a final look so we can match you with the right seller.
                </p>
              </div>

              {/* Custom Request Preview Card */}
              <div className="w-full mb-8 transform hover:scale-[1.01] transition-transform duration-300">
                <div className={cn(
                  "p-1 sm:p-1.5 rounded-[32px] flex flex-col gap-1",
                  getRequestTheme(extractedData?.category).bg
                )}>
                  <div className="flex flex-col h-full bg-white/40 backdrop-blur-sm rounded-[28px] overflow-hidden">
                    <div className="flex flex-col h-full px-2 pb-0 sm:px-2 sm:pb-0 pt-1 sm:pt-1.5">
                      <section className="flex flex-col px-6 py-8 flex-1">
                        <div className="mb-8">
                          <h1
                            className="font-semibold text-[#1A1A1A] text-[22px] sm:text-[26px] leading-tight tracking-tight"
                            style={{ fontFamily: '"Zalando Sans SemiExpanded", sans-serif', fontWeight: 600, letterSpacing: "-0.02em", maxWidth: "90%" }}
                          >
                            {extractedData?.title || "Untitled Request"}
                          </h1>
                        </div>

                        <div className="space-y-6">
                          <div className="flex flex-col">
                            <div className="flex flex-col gap-8">
                              {/* Preferences */}
                              {(extractedData?.preferences || []).length > 0 && (
                                <div className="flex flex-col gap-3">
                                  <h4 className="text-[13px] font-bold text-black/30 uppercase tracking-widest">Preferences</h4>
                                  <div className="flex flex-col">
                                    {extractedData.preferences.map((pref: any, idx: number) => (
                                      <div
                                        key={pref.id || idx}
                                        className={cn(
                                          "flex items-center gap-4 py-4 group/item border-b border-dashed border-black/5",
                                          idx === extractedData.preferences.length - 1 && "border-none"
                                        )}
                                      >
                                        <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                                        <span className="text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]">
                                          {pref.label}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Dealbreakers */}
                              {(extractedData?.dealbreakers || []).length > 0 && (
                                <div className="flex flex-col gap-3">
                                  <h4 className="text-[13px] font-bold text-black/30 uppercase tracking-widest">Dealbreakers</h4>
                                  <div className="flex flex-col">
                                    {extractedData.dealbreakers.map((deal: any, idx: number) => (
                                      <div
                                        key={deal.id || idx}
                                        className={cn(
                                          "flex items-center gap-4 py-4 group/item border-b border-dashed border-black/5",
                                          idx === extractedData.dealbreakers.length - 1 && "border-none"
                                        )}
                                      >
                                        <X className="h-4 w-4 text-red-500 shrink-0" strokeWidth={3} />
                                        <span className="text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]">
                                          {deal.label}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Stats */}
                          <div className="mt-8">
                            <div className="h-px -mx-8 bg-black/5"></div>
                            <div className="flex items-stretch -mx-8">
                              <div className="flex flex-col items-start flex-1 py-6 px-8 min-w-0">
                                <span className="text-[18px] sm:text-[20px] font-bold text-[#1A1A1A] leading-tight truncate w-full">
                                  {extractedData?.condition || "Either"}
                                </span>
                                <span className="text-[12px] font-bold uppercase tracking-wider mt-1 text-black/20">Condition</span>
                              </div>
                              <div className="w-px shrink-0 bg-black/5"></div>
                              <div className="flex flex-col items-start flex-1 py-6 px-8 min-w-0">
                                <span className="text-[18px] sm:text-[20px] font-bold text-[#1A1A1A] leading-tight truncate w-full">
                                  {budget ? `$${budget}` : (extractedData?.budget || "Negotiable")}
                                </span>
                                <span className="text-[12px] font-bold uppercase tracking-wider mt-1 text-black/20">Budget</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-500 hover:text-black hover:bg-gray-50 transition-all font-medium text-[15px] mb-12"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit the request</span>
              </button>

              {/* Launch Button Section */}
              <div className="w-full flex justify-center px-4">
                <button
                  onClick={handleFinish}
                  className="btn-sparkle w-full md:w-[22em] h-16 md:h-[6em]"
                >
                  <svg height="24" width="24" fill="#AAAAAA" viewBox="0 0 24 24" data-name="Layer 1" id="Layer_1" className="sparkle-icon">
                    <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
                  </svg>
                  <span className="btn-sparkle-text">Launch Request</span>
                </button>
              </div>

              {/* Edit Modal */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent
                  className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 sm:p-12 z-[10001]"
                  overlayClassName="z-[10000]"
                >
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold tracking-tight">Edit Request</DialogTitle>
                    <DialogDescription>Fine-tune your request before launching it to the community.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-10 py-8">
                    {/* Category Field */}
                    <div className="space-y-3">
                      <label className="text-lg font-medium text-gray-400 pl-1">Category</label>
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
                      <label className="text-lg font-medium text-gray-400 pl-1">What are you looking for?</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={extractedData?.title || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                          className="w-full h-16 pl-6 pr-14 bg-gray-50 border-2 border-gray-100 rounded-2xl text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A] focus:border-[#6925DC] outline-none transition-all"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#6925DC] transition-colors">
                          <Pencil className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Budget & Condition Row */}
                    <div className={cn("grid gap-6", shouldHideCondition ? "grid-cols-1" : "grid-cols-2")}>
                      <div className="space-y-3 font-[var(--font-sans)]">
                        <label className="text-lg font-medium text-gray-400 pl-1">Budget</label>
                        <div
                          className="w-full h-16 flex items-center justify-between px-6 bg-gray-50 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-black/10 transition-all group"
                          onClick={() => {
                            setStep("budget");
                            setIsEditModalOpen(false);
                          }}
                        >
                          <span className="text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]">
                            {budget ? `$${budget}` : extractedData?.budget || "Negotiable"}
                          </span>
                          <Pencil className="w-4 h-4 text-gray-400 group-hover:text-[#6925DC] transition-colors" />
                        </div>
                      </div>
                      {!(extractedData?.category === "Services" || extractedData?.category === "Travel") && (
                        <div className="space-y-3">
                          <label className="text-lg font-medium text-gray-400 pl-1">Condition</label>
                          <div
                            className="w-full h-16 flex items-center px-6 bg-gray-50 border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-black/10 transition-all"
                            onClick={() => {
                              setStep("condition");
                              setIsEditModalOpen(false);
                            }}
                          >
                            <span className="text-[15px] sm:text-[17px] font-medium leading-snug tracking-tight text-[#1A1A1A]">
                              {extractedData?.condition || "Either"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-10">
                      {/* Preferences */}
                      <div className="space-y-5">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-lg font-medium text-gray-400">Preferences</label>
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
                          className="flex flex-col divide-y divide-gray-100"
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
                          <label className="text-lg font-medium text-gray-400">Dealbreakers</label>
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
                          className="flex flex-col divide-y divide-gray-100"
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
                      <label className="text-lg font-medium text-gray-400 pl-1">Automated Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {(extractedData?.tags || []).map((tag: string, idx: number) => (
                          <div
                            key={idx}
                            className="group bg-gray-100 text-gray-500 border border-gray-200 text-[12px] px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 hover:bg-gray-200"
                          >
                            <span>#{tag.replace(/\s+/g, '-').toLowerCase()}</span>
                            <button
                              onClick={() => {
                                const newTags = extractedData.tags.filter((_: any, i: number) => i !== idx);
                                setExtractedData({ ...extractedData, tags: newTags });
                              }}
                              className="p-0.5 rounded-full hover:bg-gray-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="pt-8 border-t border-gray-100">
                    <Button
                      onClick={() => setIsEditModalOpen(false)}
                      className="w-full h-14 rounded-2xl bg-black text-white font-bold"
                    >
                      Done Editing
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>


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
                    if (shouldHideCondition) {
                      setStep("urgency");
                    } else {
                      setStep("condition");
                    }
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
                    if (shouldHideCondition) {
                      setStep("urgency");
                    } else {
                      setStep("condition");
                    }
                  }}
                  className="text-gray-400 hover:text-black font-bold transition-colors"
                >
                  My budget is negotiable
                </button>
              </div>
            </motion.div>
          )}

          {step === "submitting" && (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto text-center"
            >
              <div className="relative mb-12">
                <motion.div
                  className="absolute inset-0 bg-indigo-200 blur-[60px] opacity-30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="w-24 h-24 rounded-3xl bg-white shadow-2xl flex items-center justify-center relative border border-indigo-50">
                  <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                </div>
              </div>
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-expanded)' }}>
                Launching Request
              </h2>
              <p className="text-gray-400 font-medium text-lg">
                Redirecting you to your professional request page...
              </p>
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

      {/* Sticky Action Button on Mobile - Removed to avoid duplication */}

      {/* Footer Branding */}
      <div className="relative py-2 pb-32 md:pb-12 px-12 flex justify-center">
        <span className="text-sm font-semibold text-gray-300" style={{ fontFamily: 'var(--font-expanded)' }}>
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

function DictionaryHighlight({ text }: { text: string }) {
  const words = text.split(' ');
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % words.length);
    }, 150);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div
      className="relative h-full w-full font-serif text-3xl md:text-4xl leading-[1.6] text-gray-800"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
      }}
    >
      <motion.div
        className="flex flex-wrap gap-x-3 gap-y-6 pt-[240px] pb-[240px] justify-center text-center"
        animate={{ y: -activeIndex * 8 }}
        transition={{ type: "spring", stiffness: 40, damping: 25 }}
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
              i === activeIndex ? "text-black" : i < activeIndex ? "text-gray-400" : "text-gray-300"
            )}>
              {word}
            </span>
          </div>
        ))}
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 text-[15px] font-bold text-black z-20 whitespace-nowrap bg-white px-6 py-3 rounded-full border border-gray-100 shadow-sm">
        <Loader2 className="w-4 h-4 animate-spin text-[#6925DC]" />
        <span>Analyzing request...</span>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Camera, ImagePlus, X, Loader2, ArrowRight, Check, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createRequestAction } from "@/actions/request.actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { useAuth } from "@/components/layout/auth-provider";

interface AIRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtractedData {
  title: string;
  category: string;
  budget: string;
  condition: string;
  preferences: string[];
  dealbreakers: string[];
  original_text: string;
}

function InputArea({ initialValue, onChange, disabled }: { initialValue: string, onChange: (val: string) => void, disabled?: boolean }) {
  const [localValue, setLocalValue] = React.useState(initialValue);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(val);
    }, 50);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative">
      <Textarea
        autoFocus
        placeholder="Example: I'm looking for a used MacBook Pro M2, ideally 16GB RAM. Must have US keyboard and no scratches on the screen. Budget is around 1200 euros."
        className="min-h-[140px] bg-transparent border border-gray-100 focus:border-black focus-visible:ring-0 focus:ring-1 focus:ring-black rounded-2xl p-5 text-sm resize-y placeholder:text-gray-400 shadow-none transition-all duration-200"
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="absolute bottom-4 right-5 text-[10px] font-medium text-gray-400">
        {localValue.trim().length} characters
      </div>
    </div>
  );
}

export function AIRequestModal({ open, onOpenChange }: AIRequestModalProps) {
  const [inputText, setInputText] = React.useState("");
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractedData, setExtractedData] = React.useState<ExtractedData | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [authMode, setAuthMode] = React.useState<'signup' | 'login'>('signup');
  const [showAuth, setShowAuth] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  // Auto-submit when user becomes available after showing auth
  React.useEffect(() => {
    if (showAuth && user && !isSubmitting) {
      setShowAuth(false);
      handleFinalize();
    }
  }, [user, showAuth]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "Image size should be less than 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtract = async () => {
    if (!inputText.trim()) return;

    setIsExtracting(true);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: JSON.stringify({ text: inputText }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract data");
      }

      const data = await response.json();

      // Clean up dealbreakers by removing "Must have", "Must be", etc.
      if (data.dealbreakers && Array.isArray(data.dealbreakers)) {
        data.dealbreakers = data.dealbreakers.map((db: string) => {
          const cleaned = db.replace(/^(must\s+have|must\s+be|must\s+include|must)\s+/i, "");
          return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        });
      }

      setExtractedData(data);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract information. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFinalize = async () => {
    if (!extractedData) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("title", extractedData.title);
      formData.set("category", extractedData.category);

      // Improved numeric extraction
      const amountMatch = extractedData.budget.match(/([0-9.,]+)/);
      const budgetNum = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : NaN;
      formData.set("budgetMax", isNaN(budgetNum) ? "" : String(budgetNum));

      formData.set("description", extractedData.original_text);
      formData.set("preferences", JSON.stringify(extractedData.preferences.map(p => ({ label: p }))));
      formData.set("dealbreakers", JSON.stringify(extractedData.dealbreakers.map(d => ({ label: d }))));

      // Use extracted condition or default
      formData.set("condition", extractedData.condition || "Either");
      formData.set("urgency", "Standard");
      formData.set("priceLock", "open");

      if (selectedImage) {
        formData.set("image", selectedImage);
      }

      const result = await createRequestAction(formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Request created successfully!",
        });
        onOpenChange(false);
        if (result.url) {
          router.push(result.url);
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConditionOptions = (category: string) => {
    const service = ["Services", "Learning", "Health"];
    const property = ["Property"];
    const digital = ["Digital", "Culture", "Finance"];
    const experience = ["Travel", "Experiences", "Family"];

    if (service.includes(category)) {
      return [
        { id: "Entry", label: "Standard / Entry", desc: "Budget-friendly, junior professional" },
        { id: "Professional", label: "Professional", desc: "Verified experience, polished result" },
        { id: "Expert", label: "Expert / Specialist", desc: "Top-tier authority, complex work" }
      ];
    }
    if (property.includes(category)) {
      return [
        { id: "New", label: "Brand New / Off-plan", desc: "Looking for a first-time move-in" },
        { id: "Ready", label: "Ready to Move", desc: "Habitable, good condition" },
        { id: "Renovation", label: "Renovation Project", desc: "Fixer-upper, lower price point" }
      ];
    }
    if (digital.includes(category)) {
      return [
        { id: "Personal", label: "Personal Use", desc: "Standard license for one person" },
        { id: "Commercial", label: "Commercial / Resale", desc: "Includes business/resale rights" },
        { id: "Transfer", label: "Subscription Transfer", desc: "Existing account or seat transfer" }
      ];
    }
    if (experience.includes(category)) {
      return [
        { id: "Economy", label: "Economy / Basic", desc: "Essential features only" },
        { id: "Premium", label: "Premium / Comfort", desc: "Mid-range perks, flexible" },
        { id: "Luxury", label: "Luxury / VIP", desc: "All-inclusive, high-end" }
      ];
    }
    return [
      { id: "New", label: "Brand New", desc: "Original, sealed packaging" },
      { id: "Like New", label: "Open Box / Like New", desc: "Unsealed, but unused/pristine" },
      { id: "Used", label: "Pre-owned (Good)", desc: "Used but well-maintained" },
      { id: "Any", label: "Any Condition", desc: "Best price or vintage/retro" }
    ];
  };

  const getConditionLabel = (category: string) => {
    const service = ["Services", "Learning", "Health"];
    const property = ["Property"];
    const digital = ["Digital", "Culture", "Finance"];
    const experience = ["Travel", "Experiences", "Family"];

    if (service.includes(category)) return "Expertise";
    if (property.includes(category)) return "Occupancy";
    if (digital.includes(category)) return "Rights";
    if (experience.includes(category)) return "Tier";
    return "Condition";
  };

  const currentConditionOptions = React.useMemo(() => {
    return getConditionOptions(extractedData?.category || "Other/General");
  }, [extractedData?.category]);

  const currentConditionLabel = React.useMemo(() => {
    return getConditionLabel(extractedData?.category || "Other/General");
  }, [extractedData?.category]);

  const handleClose = () => {
    if (showAuth) {
      setShowAuth(false);
      return;
    }
    // If there is progress, ask for confirmation
    const hasProgress = inputText.trim().length > 0 || extractedData;
    if (hasProgress && !isSubmitting) {
      if (!window.confirm("Are you sure you want to exit? Your request progress will be lost.")) {
        return;
      }
    }

    onOpenChange(false);
    // Reset state after a short delay to avoid flicker
    setTimeout(() => {
      setExtractedData(null);
      setInputText("");
      setSelectedImage(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        overlayClassName="hidden sm:block backdrop-blur-none"
        className="fixed z-50 p-0 overflow-hidden outline-none border-none bg-white flex flex-col shadow-2xl inset-0 w-full h-[100dvh] top-0 left-0 translate-x-0 translate-y-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[1000px] sm:h-auto sm:max-h-[90vh] sm:rounded-[2rem] focus:ring-0 focus-visible:ring-0"
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-[60] p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <>
            {isExtracting && (
              <div className="absolute top-0 left-0 right-0 h-2 z-50 overflow-hidden">
                <div className="h-full bg-[#7755FF] w-[40%] animate-progress-slide relative">
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            )}

            {!isExtracting && !extractedData && (
              <DialogHeader className="px-8 pt-12 pb-10 bg-white">
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="relative shrink-0">
                    <img
                      src="/illustrations/crystal_ball.png"
                      alt="AI Magic"
                      className="w-20 h-20 relative z-10"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                      <DialogTitle className="text-2xl font-semibold text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                        AI Request Creation
                      </DialogTitle>
                      <div className="px-3 py-1 bg-[#7755FF]/10 rounded-full text-[10px] font-bold text-[#7755FF] uppercase tracking-widest leading-none">
                        Beta
                      </div>
                    </div>
                    <DialogDescription className="text-base text-gray-400 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                      Describe your perfect item and watch as our AI structures everything for you.
                    </DialogDescription>
                    <div className="flex justify-center md:justify-start mt-6 mb-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7b3ff2]/10 rounded-full text-[11px] font-semibold text-[#7b3ff2] uppercase tracking-wide">
                        <span role="img" aria-label="fire">🔥</span>
                        3x more responses with detailed descriptions
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>
            )}

            <div className={cn("px-8 pb-10 flex-1", (isExtracting || showAuth) && "pt-20")}>
              {isExtracting ? (
                <div className="h-[430px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Keyword Magnet Animation */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    <AnimatePresence>
                      {inputText.split(/\s+/).filter(w => w.length > 3).slice(0, 10).map((word, i) => (
                        <motion.div
                          key={i}
                          initial={{ 
                            x: Math.random() * 600 - 300, 
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
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                          className="absolute font-bold text-indigo-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-indigo-100 text-xs whitespace-nowrap"
                          style={{ 
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          {word.replace(/[^a-zA-Z0-9]/g, '')}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="relative z-10 flex flex-col items-center space-y-8">
                    <div className="relative">
                      <motion.div 
                        className="absolute inset-0 bg-indigo-200 blur-3xl opacity-30 rounded-full scale-150"
                        animate={{ scale: [1.2, 1.8, 1.2], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center relative border border-indigo-50">
                        <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                        Magically building your request
                      </h2>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                          <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Processing intent</span>
                        </div>
                        <p className="text-gray-400 font-medium text-sm">
                          Structuring your data into preferences and specs...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : showAuth ? (
                <div className="flex flex-col items-center max-w-4xl mx-auto w-full py-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-black mb-2 tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>Just one more step</h2>
                    <p className="text-gray-500 font-medium">Create an account to publish your request and start receiving offers.</p>
                  </div>
                  <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    {authMode === 'signup' ? (
                      <div className="space-y-6">
                        <SignUpForm onSuccess={() => {}} />
                        <p className="text-sm text-center text-gray-400 font-medium">
                          Already have an account?{" "}
                          <button onClick={() => setAuthMode('login')} className="text-[#7755FF] font-bold hover:underline">Log in</button>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <SignInForm onSuccess={() => {}} />
                        <p className="text-sm text-center text-gray-400 font-medium">
                          Don't have an account?{" "}
                          <button onClick={() => setAuthMode('signup')} className="text-[#7755FF] font-bold hover:underline">Sign up</button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : !extractedData ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-[#222234] text-left" style={{ fontFamily: 'var(--font-expanded)' }}>
                      What are you looking for?
                    </h2>
                    <InputArea
                      initialValue={inputText}
                      onChange={setInputText}
                      disabled={isExtracting}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <Button
                      onClick={handleExtract}
                      disabled={inputText.trim().length < 10 || isExtracting}
                      className="w-full h-14 rounded-full bg-[#7b3ff2] hover:bg-[#6a34d1] text-white font-bold text-sm shadow-[0_10px_30px_rgba(123,63,242,0.15)] transition-all group"
                    >
                      Generate Request
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  {inputText.trim().length > 0 && inputText.trim().length < 10 && (
                    <p className="text-center text-xs text-red-500 mt-2">Please enter at least 10 characters.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col items-center mb-8 pt-12">
                    <h2 className="text-[28px] font-bold text-[#1A1A1A] tracking-tight mb-2 text-center" style={{ fontFamily: 'var(--font-expanded)' }}>
                      Review your request
                    </h2>
                    <p className="text-gray-400 text-lg font-medium text-center">
                      This is how sellers will see your request on the feed.
                    </p>
                  </div>

                  <div className="flex flex-col h-full rounded-[28px] bg-[#f7f8f9] p-3 overflow-hidden relative max-w-[500px] mx-auto w-full">
                    <div className="bg-white rounded-[24px] p-0 flex flex-col relative overflow-hidden">
                      <div className="p-6 pb-2">
                        {/* Category Label */}
                        <div className="mb-2">
                          <span className="text-[11px] font-bold text-[#7755FF] uppercase tracking-[0.08em] bg-[#7755FF]/10 px-2 py-0.5 rounded-md">
                            {extractedData.category}
                          </span>
                        </div>

                        {/* Header: Title and Placeholder Image */}
                        <div className="flex items-start justify-between gap-4 mb-5 group/header relative">
                          <div className="flex-1 relative group/title flex items-center min-h-[64px]">
                            <textarea
                              rows={1}
                              value={extractedData.title}
                              onChange={(e) => {
                                setExtractedData({ ...extractedData, title: e.target.value });
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                              }}
                              className="w-full bg-transparent font-bold leading-tight text-[#1A1A1A] font-[family-name:var(--font-inter-display)] text-[22px] outline-none resize-none pr-8 py-0"
                              placeholder="Request Title"
                              style={{ height: 'auto', overflow: 'hidden' }}
                            />
                            <Pencil className="absolute top-1/2 -translate-y-1/2 right-0 h-4 w-4 text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 rounded-xl bg-[#f7f8f9] flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors group/img"
                          >
                            {selectedImage ? (
                              <img src={selectedImage} alt="Item" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-6 h-6 text-gray-300 group-hover/img:text-gray-600 transition-colors" />
                            )}
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-6 mb-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <label className="text-sm font-semibold text-gray-400">Preferences</label>
                              <button
                                onClick={() => setExtractedData({
                                  ...extractedData,
                                  preferences: [...extractedData.preferences, "New Preference"]
                                })}
                                className="w-6 h-6 rounded-full bg-green-50 text-[#166534] flex items-center justify-center hover:bg-green-100 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {extractedData.preferences.map((pref, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-50 text-[#015a25] text-sm font-medium group max-w-full">
                                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const newPrefs = [...extractedData.preferences];
                                      newPrefs[idx] = e.currentTarget.textContent || "";
                                      setExtractedData({ ...extractedData, preferences: newPrefs });
                                    }}
                                    className="outline-none break-words min-w-[20px] inline-block whitespace-pre-wrap"
                                  >
                                    {pref}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newPrefs = extractedData.preferences.filter((_, i) => i !== idx);
                                      setExtractedData({ ...extractedData, preferences: newPrefs });
                                    }}
                                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 shrink-0"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <label className="text-sm font-semibold text-gray-400">Dealbreakers</label>
                              <button
                                onClick={() => setExtractedData({
                                  ...extractedData,
                                  dealbreakers: [...extractedData.dealbreakers, "New Dealbreaker"]
                                })}
                                className="w-6 h-6 rounded-full bg-amber-50 text-[#92400e] flex items-center justify-center hover:bg-amber-100 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {extractedData.dealbreakers.map((deal, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-[#92400e] text-sm font-medium group max-w-full">
                                  <X className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const newDeals = [...extractedData.dealbreakers];
                                      newDeals[idx] = e.currentTarget.textContent || "";
                                      setExtractedData({ ...extractedData, dealbreakers: newDeals });
                                    }}
                                    className="outline-none break-words min-w-[20px] inline-block whitespace-pre-wrap"
                                  >
                                    {deal}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newDeals = extractedData.dealbreakers.filter((_, i) => i !== idx);
                                      setExtractedData({ ...extractedData, dealbreakers: newDeals });
                                    }}
                                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 shrink-0"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Condition & Budget Section - Matching Discover Card Perfectly */}
                      <div className="mt-auto">
                        <div className="h-1 bg-[#f7f8f9]" />
                        <div className="flex items-stretch">
                          <div className="flex flex-col items-center flex-1 py-4 justify-center min-w-0 px-2 group/condition relative text-[#7b3ff2]">
                            <span className="text-[13px] text-gray-400 font-medium leading-none mb-1.5 text-center">{currentConditionLabel}</span>
                            <div className="relative group/sel">
                              <select
                                value={extractedData.condition}
                                onChange={(e) => setExtractedData({ ...extractedData, condition: e.target.value })}
                                className="bg-transparent text-[15.5px] font-[600] outline-none cursor-pointer appearance-none px-6 py-1 text-center"
                              >
                                {currentConditionOptions.map(opt => (
                                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                              </select>
                              <Pencil className="absolute top-1/2 -right-1 -translate-y-1/2 h-3 w-3 text-gray-400 opacity-0 group-hover/sel:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                          </div>

                          <div className="w-1 bg-[#f7f8f9] shrink-0" />

                          <div className="flex flex-col items-center flex-1 py-4 justify-center min-w-0 px-2 group/budget relative">
                            <span className="text-[13px] text-gray-400 font-medium leading-none mb-1.5 text-center">Budget</span>
                            <div className="flex items-center justify-center w-full relative group/input text-[#7b3ff2]">
                              <div className="flex items-center">
                                <span className="text-[15.5px] font-[600] mr-0.5 shrink-0">$</span>
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => {
                                    const val = e.currentTarget.textContent?.replace(/[^0-9.]/g, '') || "";
                                    setExtractedData({ ...extractedData, budget: val });
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      e.currentTarget.blur();
                                    }
                                  }}
                                  className="bg-transparent text-[15.5px] font-[600] outline-none min-w-[10px] inline-block"
                                >
                                  {extractedData.budget || "---"}
                                </span>
                              </div>
                              <Pencil className="absolute top-1/2 right-4 -translate-y-1/2 h-3 w-3 text-gray-400 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2 max-w-[500px] mx-auto w-full">
                    <Button
                      variant="ghost"
                      onClick={() => setExtractedData(null)}
                      className="flex-1 h-14 rounded-full font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all text-[16px]"
                    >
                      Restart
                    </Button>
                    <Button
                      onClick={handleFinalize}
                      disabled={isSubmitting}
                      className="flex-[2] h-14 rounded-full bg-[#7b3ff2] hover:bg-[#6a34d1] text-white font-bold text-[16px] shadow-[0_10px_30px_rgba(123,63,242,0.15)] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Launch Request</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        </div>
      </DialogContent>
    </Dialog>
  );
}

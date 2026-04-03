"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/layout/auth-provider";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { requestSchema } from "@/lib/validators";
import { createRequestAction } from "@/actions/request.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { CategoryCombobox } from "@/components/ui/category-combobox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X, GripVertical, Info, Plus, Check, Sparkles, Crown, LockKeyhole, MapPin, ChevronLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MAIN_CATEGORIES, SUBCATEGORIES, type MainCategory } from "@/lib/categories";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem } from "@/lib/types";

type RequestValues = z.infer<typeof requestSchema>;

export function RequestForm({
  onSuccess,
  userCountry,
  isModal = false,
  onCancel,
  onStepChange
}: {
  onSuccess?: () => void,
  userCountry?: string | null,
  isModal?: boolean,
  onCancel?: () => void,
  onStepChange?: (step: number) => void
}) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [referenceLinks, setReferenceLinks] = React.useState<string[]>([]);
  const [linkInput, setLinkInput] = React.useState("");
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [preferences, setPreferences] = React.useState<Array<{ label: string; note?: string }>>([]);
  const [dealbreakers, setDealbreakers] = React.useState<Array<{ label: string; note?: string }>>([]);
  const [showPrefInput, setShowPrefInput] = React.useState(false);
  const [showDbInput, setShowDbInput] = React.useState(false);
  const [inlinePrefValue, setInlinePrefValue] = React.useState("");
  const [inlineDbValue, setInlineDbValue] = React.useState("");
  const [authMode, setAuthMode] = React.useState<'signup' | 'login'>('signup');
  const [draggedType, setDraggedType] = React.useState<"preference" | "dealbreaker" | null>(null);
  const [triedStep2Next, setTriedStep2Next] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [showEditSummary, setShowEditSummary] = React.useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = React.useState(false);

  // Notify parent of step changes
  React.useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const steps = [
    { id: 1, title: 'Item & Info' },
    { id: 2, title: 'Budget' },
    { id: 3, title: 'Condition' },
    { id: 4, title: 'Preferences' },
    { id: 5, title: 'Dealbreakers' },
    { id: 6, title: 'Details' },
    { id: 7, title: 'Review' },
    ...(!user ? [{ id: 8, title: 'Authenticate' }] : [])
  ];

  const stepTips = {
    1: [
      "Select the most accurate category",
      "Give your request a clear, descriptive title",
      "Mention the brand and model if possible"
    ],
    2: [
      "Set a realistic budget range",
      "Specify the condition you're looking for",
      "Use Advanced matching for strict rules"
    ],
    3: [
      "Select 'New & Used' if condition doesn't matter",
      "Condition helps sellers provide accurate offers"
    ],
    4: [
      "Add detailed preferences to help sellers",
      "List strict dealbreakers to filter unwanted offers",
      "Preferences guide sellers, dealbreakers stop them"
    ],
    5: [
      "Add context with strong reference links",
      "Upload clear images to communicate expectations",
      "Reference material gets you better offers"
    ]
  };

  const proceedToNextStep = async () => {
    if (currentStep === 2) setTriedStep2Next(true);
    const fieldsToValidate = currentStep === 1 ? ["title", "category"] : currentStep === 2 ? ["budgetMax"] : [];
    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate as any) : true;
    if (isValid) {
      if (currentStep === 7 && user) {
        form.handleSubmit(onSubmit)();
        return;
      }
      const maxStep = user ? 7 : 8;
      setCurrentStep((prev) => Math.min(prev + 1, 8));
      setShowEditSummary(false); // Reset summary view on step change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (currentStep === 2) setTriedStep2Next(false);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budgetMax: null,
      priceLock: "open",
      exactItem: false,
      exactSpecification: false,
      exactPrice: false,
      country: userCountry || "",
      condition: null,
      urgency: "Standard",
      referenceLinks: "",
    },
  });



  const titleValue = form.watch("title");
  const budgetMax = form.watch("budgetMax") ?? 0;
  const priceLock = form.watch("priceLock");
  const categoryValue = form.watch("category");
  const urgencyValue = form.watch("urgency") || "Standard";

  // Sync userCountry prop to form state if it changes or arrives after initial render
  React.useEffect(() => {
    if (userCountry && !form.getValues("country")) {
      form.setValue("country", userCountry);
    }
  }, [userCountry, form]);
  const urgency = form.watch("urgency");

  // Character counter for title
  const titleLength = titleValue.length;
  const titleMaxLength = 120;

  // Handle reference link input
  const handleLinkInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addLink();
    }
  };

  const addLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
      if (!referenceLinks.includes(trimmed)) {
        setReferenceLinks([...referenceLinks, trimmed]);
        setLinkInput("");
        setErrors((prev) => ({ ...prev, linkInput: "" }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, linkInput: "Please enter a valid URL" }));
    }
  };

  const removeLink = (index: number) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    if (imageFiles.length + fileArray.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    // Validate file sizes
    for (const file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 5MB limit`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError(`File ${file.name} is not an image`);
        return;
      }
    }

    setImageFiles((prev) => [...prev, ...fileArray]);
    setIsUploading(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      fileArray.forEach((file) => uploadFormData.append("images", file));

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload images");
      }

      const data = await response.json();
      setUploadedImages((prev) => [...prev, ...data.urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
      setImageFiles((prev) => prev.slice(0, prev.length - fileArray.length));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setUploadedImages(newImages);

    const newFiles = [...imageFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    setImageFiles(newFiles);

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Budget slider handler
  const handleBudgetChange = (value: number[]) => {
    form.setValue("budgetMax", value[0], { shouldValidate: true });
  };

  const handleBudgetMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      form.setValue("budgetMax", null, { shouldValidate: true });
      return;
    }
    const value = parseFloat(val);
    if (!isNaN(value)) {
      form.setValue("budgetMax", Math.max(0, value), { shouldValidate: true });
    }
  };

  // Dynamic CTA label
  const getCTALabel = () => {
    if (isPending) return "Submitting...";
    return "Submit";
  };

  const onSubmit = async (values: RequestValues) => {
    if (currentStep < (user ? 3 : 4)) {
      proceedToNextStep();
      return;
    }

    setErrors({});
    setError(null);
    setError(null);

    // Auto-generate description from preferences/dealbreakers (always, since description field was removed)
    const prefText = preferences.length > 0
      ? `Preferences: ${preferences.map(p => p.label).join(", ")}`
      : "";
    const dealText = dealbreakers.length > 0
      ? `Dealbreakers: ${dealbreakers.map(d => d.label).join(", ")}`
      : "";
    const description = [prefText, dealText].filter(Boolean).join(". ") || "Looking for the requested item.";

    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", description);
    formData.set("category", values.category);
    formData.set(
      "budgetMax",
      Number.isFinite(values.budgetMax) ? String(values.budgetMax) : ""
    );
    formData.set("country", values.country || "");
    formData.set("condition", values.condition || "");
    formData.set("urgency", values.urgency || "");
    formData.set("priceLock", values.priceLock || "open");
    formData.set("exactItem", values.exactItem ? "true" : "false");
    formData.set("exactSpecification", values.exactSpecification ? "true" : "false");
    formData.set("exactPrice", values.exactPrice ? "true" : "false");

    // Join reference links with commas
    if (referenceLinks.length > 0) {
      formData.set("referenceLinks", referenceLinks.join(","));
    }

    // Add preferences and dealbreakers as JSON
    formData.set("preferences", JSON.stringify(preferences));
    formData.set("dealbreakers", JSON.stringify(dealbreakers));

    // Add image URLs
    uploadedImages.forEach((url) => {
      formData.append("imageUrls", url);
    });

    startTransition(async () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });

      try {
        const res = await createRequestAction(formData);

        if (res?.error) {
          setError(res.error);
          // If there are field-specific errors, set them
          if (res.fieldErrors) {
            setErrors(res.fieldErrors);
          } else {
            // Try to parse field errors from the error message
            const fieldErrorMatch = res.error.match(/(\w+):\s*(.+?)(?:\.|$)/g);
            if (fieldErrorMatch) {
              const parsedErrors: Record<string, string> = {};
              fieldErrorMatch.forEach((match: string) => {
                const parsed = match.match(/(\w+):\s*(.+?)(?:\.|$)/);
                if (parsed && parsed[1] && parsed[2]) {
                  parsedErrors[parsed[1]] = parsed[2].trim();
                }
              });
              if (Object.keys(parsedErrors).length > 0) {
                setErrors(parsedErrors);
              }
            }
          }
          return;
        } else {
          if (onSuccess) {
            onSuccess();
          }
          if (res.url) {
            router.push(res.url);
          } else {
            router.refresh();
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    });
  };

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(errors).length > 0 || error !== null;

  // Construct preview data
  const previewRequest: RequestItem = {
    id: "preview",
    user_id: "preview",
    title: titleValue || "Your Request Title",
    slug: "preview-slug",
    description: `<!--REQUEST_PREFS:${JSON.stringify({
      priceLock: form.watch("priceLock"),
      exactItem: form.watch("exactItem"),
      exactSpecification: form.watch("exactSpecification"),
      exactPrice: form.watch("exactPrice"),
      preferences,
      dealbreakers,
    })}-->`,
    category: form.watch("category") || "Category",
    budget_min: null,
    budget_max: form.watch("budgetMax") || null,
    country: form.watch("country") || "Country not set",
    condition: form.watch("condition") || "New",
    urgency: form.watch("urgency") || "Standard",
    status: "open",
    winner_submission_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submissionCount: 0,
  };

  // Auto-submit when user logs in on Step 8
  React.useEffect(() => {
    if (user && currentStep === 8 && !isAutoSubmitting) {
      setIsAutoSubmitting(true);
      form.handleSubmit(onSubmit)();
    }
  }, [user, currentStep, isAutoSubmitting, form, onSubmit]);

  return (
    <div className={cn(
      "grid grid-cols-1 gap-0 items-start",
      isModal ? "lg:grid-cols-1" : "lg:grid-cols-8"
    )}>
      <div className={cn(
        currentStep === 8 ? "pb-0" : "pb-8",
        isModal ? "lg:col-span-1 pr-0" : "lg:col-span-1 lg:border-r border-[#e5e7eb] pr-12"
      )}>
        {/* Step-by-Step Navigation - Removed top stepper as per request */}

        <div
          className={cn(currentStep === 1 ? "space-y-0" : "space-y-12")}
        >
          {/* Persistent Header */}
          {!isModal && (
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground" style={{ fontFamily: 'var(--font-expanded)' }}>
                  Create a request
                </h1>
                <p className="text-sm text-gray-500">
                  Tell us what you're looking for to receive offers
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: What are you looking for? */}
          {currentStep === 1 && (
            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-2">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight text-[#222234] text-center" style={{ fontFamily: 'var(--font-expanded)' }}>
                  What are you looking for?
                </h2>
                <div className="space-y-4">
                  <CategoryCombobox
                    title={form.watch("title") || ""}
                    category={form.watch("category") || ""}
                    onTitleChange={(val) => {
                      form.setValue("title", val, { shouldValidate: true });
                      // Clear category ONLY if title is cleared
                      if (!val) form.setValue("category", "", { shouldValidate: true });
                      setErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    onCategoryChange={(val) => {
                      form.setValue("category", val, { shouldValidate: true });
                      setErrors((prev) => ({ ...prev, category: "" }));
                    }}
                  />
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: Budget */}
          {currentStep === 2 && (
            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight text-[#222234] text-center" style={{ fontFamily: 'var(--font-expanded)' }}>
                  What is your budget?
                </h2>
                <div className="space-y-4">
                  <div className="relative group p-1 -m-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
                    <Input
                      id="budgetMax"
                      type="number"
                      step="10"
                      min={0}
                      autoFocus
                      value={form.watch("budgetMax") ?? ""}
                      onChange={handleBudgetMaxChange}
                      placeholder="Enter amount"
                      className={cn(
                        "h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold pl-8",
                        ((triedStep2Next || form.formState.submitCount > 0) && form.formState.errors.budgetMax) && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                </div>
                {(triedStep2Next || form.formState.isSubmitted || form.formState.submitCount > 0) && form.formState.errors.budgetMax && (
                  <p className="text-xs text-red-600 font-medium mt-1">{form.formState.errors.budgetMax.message}</p>
                )}
              </div>
            </section>
          )}

          {/* SECTION 3: Condition */}
          {currentStep === 3 && (
            <section className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight text-[#222234] text-center" style={{ fontFamily: 'var(--font-expanded)' }}>
                  What condition are you looking for?
                </h2>
                <div className="flex flex-row gap-3 w-full">
                  {[
                    { label: "Brand New", value: "New" },
                    { label: "Used", value: "Used" },
                    { label: "New & Used", value: "Either" }
                  ].map((option) => {
                    const isSelected = form.watch("condition") === option.value;
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 px-4 rounded-xl border h-16 transition-all font-medium text-sm",
                          isSelected
                            ? "bg-white text-black !border-[#222234] border-2 shadow-sm scale-[1.02]"
                            : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                        )}
                        onClick={() => {
                          form.setValue("condition", option.value);
                          proceedToNextStep();
                        }}
                      >
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: Preferences */}
          {currentStep === 4 && (
            <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6 mb-10">
                <h2 className="text-2xl font-bold tracking-tight text-[#222234] text-center" style={{ fontFamily: 'var(--font-expanded)' }}>
                  Tell sellers your preferences
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-10 items-start">
                <div className="space-y-4">
                  {/* Preferences Section - Tag Style */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 p-3.5 rounded-xl border border-[#e5e7eb] bg-white focus-within:border-[#222234] focus-within:ring-1 focus-within:ring-[#222234]/5 transition-all min-h-[56px] items-center">
                      {preferences.map((item, index) => (
                        <div
                          key={`pref-${index}`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium group animate-in fade-in zoom-in duration-200"
                        >
                          <span>{item.label}</span>
                          <button
                            type="button"
                            onClick={() => setPreferences(preferences.filter((_, i) => i !== index))}
                            className="p-0.5 hover:bg-green-200/50 rounded-md transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <Input
                        placeholder={preferences.length === 0 ? "Brand, model, or specific preference" : ""}
                        autoFocus
                        className="flex-1 min-w-[200px] h-8 border-none focus-visible:ring-0 px-0 text-base font-medium placeholder:text-gray-400 placeholder:font-normal bg-transparent"
                        value={inlinePrefValue}
                        onChange={(e) => setInlinePrefValue(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === ",") && inlinePrefValue.trim()) {
                            e.preventDefault();
                            const newTags = inlinePrefValue.split(",").map(t => t.trim()).filter(Boolean);
                            if (newTags.length > 0) {
                              const capitalizedTags = newTags.map(label => ({
                                label: label.charAt(0).toUpperCase() + label.slice(1)
                              }));
                              setPreferences([...preferences, ...capitalizedTags]);
                            }
                            setInlinePrefValue("");
                          } else if (e.key === "Backspace" && !inlinePrefValue && preferences.length > 0) {
                            setPreferences(preferences.slice(0, -1));
                          }
                        }}
                        onBlur={() => {
                          if (inlinePrefValue.trim()) {
                            const capitalized = inlinePrefValue.trim().charAt(0).toUpperCase() + inlinePrefValue.trim().slice(1);
                            setPreferences([...preferences, { label: capitalized }]);
                            setInlinePrefValue("");
                          }
                        }}
                      />
                    </div>
                    <p className="text-[13px] text-gray-400 font-medium pl-1">
                      (optional, separate tags by comma or enter)
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: Dealbreakers */}
          {currentStep === 5 && (
            <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-6 mb-10">
                <h2 className="text-2xl font-bold tracking-tight text-[#222234] text-center" style={{ fontFamily: 'var(--font-expanded)' }}>
                  Next, share your dealbreakers
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-10 items-start">
                <div className="space-y-4">
                  {/* Dealbreakers Section - Tag Style */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 p-3.5 rounded-xl border border-[#e5e7eb] bg-white focus-within:border-[#222234] focus-within:ring-1 focus-within:ring-[#222234]/5 transition-all min-h-[56px] items-center">
                      {dealbreakers.map((item, index) => (
                        <div
                          key={`deal-${index}`}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-[#FF5F00] text-sm font-medium group animate-in fade-in zoom-in duration-200"
                        >
                          <span>{item.label}</span>
                          <button
                            type="button"
                            onClick={() => setDealbreakers(dealbreakers.filter((_, i) => i !== index))}
                            className="p-0.5 hover:bg-orange-200/50 rounded-md transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <Input
                        placeholder={dealbreakers.length === 0 ? "No scratches, no repairs, etc." : ""}
                        autoFocus
                        className="flex-1 min-w-[200px] h-8 border-none focus-visible:ring-0 px-0 text-base font-medium placeholder:text-gray-400 placeholder:font-normal bg-transparent"
                        value={inlineDbValue}
                        onChange={(e) => setInlineDbValue(e.target.value)}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === ",") && inlineDbValue.trim()) {
                            e.preventDefault();
                            const newTags = inlineDbValue.split(",").map(t => t.trim()).filter(Boolean);
                            if (newTags.length > 0) {
                              const capitalizedTags = newTags.map(label => ({
                                label: label.charAt(0).toUpperCase() + label.slice(1)
                              }));
                              setDealbreakers([...dealbreakers, ...capitalizedTags]);
                            }
                            setInlineDbValue("");
                          } else if (e.key === "Backspace" && !inlineDbValue && dealbreakers.length > 0) {
                            setDealbreakers(dealbreakers.slice(0, -1));
                          }
                        }}
                        onBlur={() => {
                          if (inlineDbValue.trim()) {
                            const capitalized = inlineDbValue.trim().charAt(0).toUpperCase() + inlineDbValue.trim().slice(1);
                            setDealbreakers([...dealbreakers, { label: capitalized }]);
                            setInlineDbValue("");
                          }
                        }}
                      />
                    </div>
                    <p className="text-[13px] text-gray-400 font-medium pl-1">
                      (optional, separate tags by comma or enter)
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 6: Additional Details */}
          {currentStep === 6 && (
            <section className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2 mb-10 text-left">
                <h2 className="text-2xl font-bold tracking-tight text-[#222234]" style={{ fontFamily: 'var(--font-expanded)' }}>
                  Then, add final details to your request
                </h2>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  Help sellers give you the best offer by adding links and images.
                </p>
              </div>
              <div className="space-y-12">
                {/* Reference Links Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm font-semibold text-gray-500">Share a link of a similar item or inspiration</Label>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste a reference URL"
                        value={linkInput}
                        onChange={(e) => {
                          setLinkInput(e.target.value);
                          setErrors((prev) => ({ ...prev, linkInput: "" }));
                        }}
                        onKeyDown={handleLinkInputKeyDown}
                        onBlur={addLink}
                        className={cn(
                          "h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal",
                          errors.linkInput && "border-red-500 focus-visible:ring-red-500"
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addLink}
                        className="shrink-0 h-14 w-14 rounded-xl border flex items-center justify-center p-0"
                      >
                        <Plus className="h-5 w-5" strokeWidth={2.5} />
                      </Button>
                    </div>
                    {referenceLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {referenceLinks.map((link, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-white text-xs transition-all"
                          >
                            <span className="text-[#222234] truncate max-w-[150px] font-medium">{link}</span>
                            <button
                              type="button"
                              onClick={() => removeLink(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reference Images Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm font-semibold text-gray-500">Add a few example images</Label>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {uploadedImages.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group bg-white"
                      >
                        <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== index))}
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < 5 && (
                      <label className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#222234]/30 hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageUpload(e.target.files)}
                          disabled={isUploading}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-1.5">
                          <Plus className="h-5 w-5 text-[#222234] group-hover:scale-110 transition-transform" />
                          <span className="text-[11px] font-bold text-gray-400">Add</span>
                        </div>
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-[#222234] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </label>
                    )}
                  </div>
                </div>

                {/* Advanced Matching Accordion - Collapsed by default */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white mt-10">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced-matching" className="border-none">
                      <AccordionTrigger className="py-2 hover:no-underline transition-all px-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold text-[#222234] cursor-pointer">Advanced Matching</Label>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-8 space-y-10 pt-8 px-4 text-left">
                        <div className="space-y-8">
                          {/* Lock price */}
                          <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1 pr-4">
                              <Label className="text-base font-semibold text-gray-700">Lock price</Label>
                              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                Proposals above your budget won’t be accepted.
                              </p>
                            </div>
                            <Switch
                              checked={priceLock === "locked"}
                              onCheckedChange={(checked) => {
                                form.setValue("priceLock", checked ? "locked" : "open");
                              }}
                            />
                          </div>

                          {/* Exact Only vs Exact + Similar */}
                          <div className="flex items-center justify-between pt-6 border-t border-gray-100/60">
                            <div className="space-y-1 flex-1 pr-4">
                              <Label className="text-base font-semibold text-gray-700">Exact match only</Label>
                              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                Exclude similar models or variations.
                              </p>
                            </div>
                            <Switch
                              checked={form.watch("exactItem")}
                              onCheckedChange={(checked) => {
                                form.setValue("exactItem", checked);
                              }}
                            />
                          </div>

                          {/* No Alternatives Allowed Switch */}
                          <div className="flex items-center justify-between pt-6 border-t border-gray-100/60">
                            <div className="space-y-1 flex-1 pr-4">
                              <Label htmlFor="exactSpecification" className="text-base font-semibold text-gray-700">Strict requirements</Label>
                              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                Match all preferences and condition exactly.
                              </p>
                            </div>
                            <Switch
                              id="exactSpecification"
                              checked={form.watch("exactSpecification")}
                              onCheckedChange={(checked) => {
                                form.setValue("exactSpecification", checked);
                              }}
                            />
                          </div>

                          {/* Urgency */}
                          <div className="space-y-4 pt-6 border-t border-gray-100/60">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Label className="text-base font-semibold text-gray-700">Urgency</Label>
                              <Crown className="h-4 w-4 text-amber-500 fill-amber-500 opacity-20" />
                            </div>
                            <div className="flex flex-row gap-2 w-full">
                              {["ASAP", "This week", "Standard"].map((option) => {
                                const isSelected = (form.watch("urgency") || "Standard") === option;
                                return (
                                  <Button
                                    key={option}
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      "flex-1 px-2 rounded-xl border h-11 transition-all text-xs font-medium",
                                      isSelected
                                        ? "bg-white text-black !border-[#222234] border shadow-sm"
                                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                                    )}
                                    onClick={() => form.setValue("urgency", option)}
                                  >
                                    {option}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 7: Review your request */}
          {currentStep === 7 && (
            <div className="py-6 w-full animate-in fade-in slide-in-from-right-4 duration-500">
              {showEditSummary ? (
                <div className="space-y-8">
                  <div className="text-left mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center" style={{ fontFamily: 'var(--font-expanded)' }}>Edit your request</h2>
                    <p className="text-sm text-gray-500">Review and modify any section of your request before publishing.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: "Item & Info", value: form.watch("title"), step: 1 },
                      { label: "Budget", value: form.watch("budgetMax") ? `$${form.watch("budgetMax")}` : "Not set", step: 2 },
                      { label: "Condition", value: form.watch("condition") || "Not set", step: 3 },
                      { label: "Preferences", value: preferences.length > 0 ? `${preferences.length} tags` : "None", step: 4 },
                      { label: "Dealbreakers", value: dealbreakers.length > 0 ? `${dealbreakers.length} tags` : "None", step: 5 },
                      { label: "Links & Media", value: `${referenceLinks.length} links, ${uploadedImages.length} images`, step: 6 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#7755FF] hover:text-[#6644EE] hover:bg-[#7755FF]/5 font-semibold"
                          onClick={() => {
                            setCurrentStep(item.step);
                            setShowEditSummary(false);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      variant="ghost"
                      className="text-gray-500 hover:text-gray-900 font-medium"
                      onClick={() => setShowEditSummary(false)}
                    >
                      Back to preview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 flex flex-col items-center">
                  <div className="text-center mb-4 w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center" style={{ fontFamily: 'var(--font-expanded)' }}>Review your request</h2>
                    <p className="text-sm text-gray-500">This is how sellers will see your request on the feed.</p>
                  </div>

                  <div className="w-full max-w-[500px]">
                    <RequestCard
                      request={previewRequest}
                      variant="feed"
                      images={uploadedImages}
                      isPreview={true}
                      isFirst={true}
                      isLast={true}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowEditSummary(true)}
                    className="h-10 px-6 rounded-full font-semibold text-[#7755FF] hover:bg-[#7755FF]/5 border border-[#7755FF]/20"
                  >
                    Edit request
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 8 && !user && (
            <div className="pt-0 pb-2 w-full animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-row gap-12 items-stretch w-full">
                <div className="w-[400px] shrink-0 space-y-6">
                  <div className="text-left mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 text-left" style={{ fontFamily: 'var(--font-expanded)' }}>Almost there!</h2>
                    <p className="text-sm text-gray-500 text-pretty mt-4">
                      <span className="text-green-600 font-bold">Your request is ready.</span> Sign in or create an account to publish your request and start receiving offers.
                    </p>
                  </div>
                  {authMode === 'signup' ? (
                    <div className="space-y-6">
                      <SignUpForm onSuccess={() => { setIsAutoSubmitting(true); form.handleSubmit(onSubmit)(); }} />
                      <p className="text-sm text-center text-gray-500">
                        Already using Onseek?{" "}
                        <button
                          onClick={() => setAuthMode('login')}
                          className="text-[#7755FF] font-semibold hover:underline"
                        >
                          Log in
                        </button>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <SignInForm onSuccess={() => { setIsAutoSubmitting(true); form.handleSubmit(onSubmit)(); }} />
                      <p className="text-sm text-center text-gray-500">
                        Don't have an account?{" "}
                        <button
                          onClick={() => setAuthMode('signup')}
                          className="text-[#7755FF] font-semibold hover:underline"
                        >
                          Sign up
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                {/* Right column: Perks Section (Wider) */}
                <div className="flex-1 min-w-0">
                  <div className="p-8 rounded-[1.5rem] bg-gray-50 h-full flex flex-col justify-center">
                    <div className="mb-8 flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-[#222234]" style={{ fontFamily: 'var(--font-expanded)' }}>Join the community</h3>
                    </div>

                    <div className="space-y-6">
                      {[
                        { icon: <ShieldCheck className="h-5 w-5 text-green-500" />, title: "Verified Sellers", desc: "Buy with confidence from vetted professionals." },
                        { icon: <Sparkles className="h-5 w-5 text-[#7755FF]" />, title: "Private Matches", desc: "Get exclusive offers for your specific request." },
                        { icon: <LockKeyhole className="h-5 w-5 text-orange-500" />, title: "Secure Deals", desc: "Your data and payments are always protected." },
                        { icon: <Crown className="h-5 w-5 text-yellow-500" />, title: "Premium Access", desc: "First-look at rare items before they hit the feed." }
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

                    <div className="mt-auto pt-8 border-t border-gray-200/50 flex items-center gap-4">
                      <div className="flex -space-x-3 items-center">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-10 bg-cover bg-center"
                            style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=user${i + 20})` }} />
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-[#7755FF] flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+</div>
                      </div>
                      <p className="text-xs text-gray-400 font-medium tracking-tight">Joined by 50,000+ members</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Navigation Buttons - Fixed Bottom Layout */}
          <div className={cn(
            "flex items-center justify-between bg-white",
            currentStep === 8 ? "hidden" : (currentStep === 1 ? "mt-0" : "mt-12"),
            isModal && "sticky bottom-0 -mx-8 px-8 pt-4 pb-2 border-none z-10"
          )}>
            <div>
              {isModal && currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  className="h-10 px-6 rounded-full font-semibold text-[#222234] border-none hover:bg-gray-50 transition-all text-sm"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  className="h-12 px-6 rounded-full font-semibold text-[#222234] border border-gray-100 hover:bg-transparent transition-all flex items-center gap-2 group"
                >
                  <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  <span>Back</span>
                </Button>
              )}

              {(currentStep < 8) && (
                <Button
                  type="button"
                  onClick={proceedToNextStep}
                  disabled={(currentStep === 1 && (!titleValue?.trim() || !categoryValue)) || (currentStep === 2 && !form.watch("budgetMax")) || isAutoSubmitting}
                  className={cn(
                    "h-12 px-10 rounded-full font-semibold text-base min-w-[140px] shadow-lg shadow-gray-200/50 transition-all",
                    ((currentStep === 1 && (!titleValue?.trim() || !categoryValue)) || (currentStep === 2 && !form.watch("budgetMax")) || isAutoSubmitting)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-[#222234] hover:bg-[#2a2a3f] text-white",
                    (currentStep === 1 && titleValue.length < 3) && "hidden", // Hide next button on step 1 until categories are displayed
                    currentStep === 3 && "hidden", // Hide next button on condition step
                    showEditSummary && "hidden", // Hide next button on edit summary screen
                    (currentStep === 8 && user) && "hidden" // Hide next button on auth step if user already logged in
                  )}
                >
                  {currentStep === 1 ? "Next: Budget" :
                    currentStep === 2 ? "Next: Condition" :
                      currentStep === 3 ? "Next: Preferences" :
                        currentStep === 4 ? "Next: Dealbreakers" :
                          currentStep === 5 ? "Next: Details" :
                            currentStep === 6 ? "Next: Review" :
                              currentStep === 7 ? (user ? "Publish" : "Finalize") :
                                "Next"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Sidebar - Hidden in Modal */}
      {!isModal && (
        <div className="lg:col-span-3 lg:pl-12 lg:sticky lg:top-8 mt-12 lg:mt-0">
          <div className="space-y-4 max-w-[460px]">
            <div className="flex items-center gap-2 text-foreground px-1">
              <Sparkles className="h-5 w-5 text-[#7755FF]" />
              <h3 className="text-lg font-semibold tracking-tight">Live Preview</h3>
            </div>

            <div className="pointer-events-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl">
              <RequestCard
                request={previewRequest}
                variant="feed"
                images={uploadedImages}
                isPreview={true}
                isFirst={true}
                isLast={true}
              />
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 p-6 bg-gray-50/30">
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <Info className="h-4 w-4" />
                <h4 className="text-sm font-medium">Why a preview?</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                This is exactly how sellers will see your request in their feed.
                Make sure your title and preferences are clear to get the best offers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

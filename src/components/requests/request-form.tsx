"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { Upload, X, GripVertical, Info, Plus, Check, Sparkles, Crown, LockKeyhole } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MAIN_CATEGORIES, SUBCATEGORIES, type MainCategory } from "@/lib/categories";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem } from "@/lib/types";

type RequestValues = z.infer<typeof requestSchema>;

export function RequestForm({ onSuccess, userCountry }: { onSuccess?: () => void, userCountry?: string | null }) {
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
  const [preferencesTab, setPreferencesTab] = React.useState<"preferences" | "dealbreakers">("preferences");
  const [preferences, setPreferences] = React.useState<Array<{ label: string; note?: string }>>([]);
  const [dealbreakers, setDealbreakers] = React.useState<Array<{ label: string; note?: string }>>([]);
  const [preferenceInput, setPreferenceInput] = React.useState("");
  const [dealbreakerInput, setDealbreakerInput] = React.useState("");
  const [preferenceNote, setPreferenceNote] = React.useState("");
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isEnhancedOpen, setIsEnhancedOpen] = React.useState(false);

  const steps = [
    { id: 1, title: 'Item & Info' },
    { id: 2, title: 'Constraints' }
  ];

  const stepTips = {
    1: [
      "Be specific about what you're looking for",
      "Add detailed preferences to help guide sellers",
      "List strict dealbreakers to filter unwanted proposals immediately"
    ],
    2: [
      "Select the most accurate category for your item",
      "Set a realistic budget range",
      "Use Price Lock if you strictly cannot exceed your max budget"
    ],
    3: [
      "Add context with strong reference links",
      "Upload clear images to communicate your expectation",
      "The more reference material you provide, the better the offers"
    ]
  };

  const proceedToNextStep = async () => {
    const fieldsToValidate = currentStep === 1 ? ["title", "category"] : ["budgetMax"];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budgetMax: 0,
      priceLock: "open",
      exactItem: false,
      exactSpecification: false,
      exactPrice: false,
      country: userCountry || "",
      condition: "New",
      urgency: "Standard",
      referenceLinks: "",
    },
  });

  const titleValue = form.watch("title");
  const budgetMax = form.watch("budgetMax") ?? 0;
  const priceLock = form.watch("priceLock");

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

  // Handle preferences/dealbreakers
  const handlePreferenceInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPreferenceOrDealbreaker();
    }
  };

  const addPreferenceOrDealbreaker = () => {
    if (preferencesTab === "preferences") {
      const trimmed = preferenceInput.trim();
      if (!trimmed) return;

      if (preferences.length >= 10) {
        setErrors((prev) => ({ ...prev, preferences: "Maximum 10 preferences allowed" }));
        return;
      }
      if (!preferences.find((p) => p.label === trimmed)) {
        setPreferences([...preferences, { label: trimmed, note: undefined }]);
        setPreferenceInput("");
        setErrors((prev) => ({ ...prev, preferences: "" }));
      }
    } else {
      const trimmed = dealbreakerInput.trim();
      if (!trimmed) return;

      if (dealbreakers.length >= 10) {
        setErrors((prev) => ({ ...prev, dealbreakers: "Maximum 10 dealbreakers allowed" }));
        return;
      }
      if (!dealbreakers.find((d) => d.label === trimmed)) {
        setDealbreakers([...dealbreakers, { label: trimmed, note: undefined }]);
        setDealbreakerInput("");
        setErrors((prev) => ({ ...prev, dealbreakers: "" }));
      }
    }
  };

  const removePreferenceOrDealbreaker = (index: number, type: "preferences" | "dealbreakers") => {
    if (type === "preferences") {
      setPreferences(preferences.filter((_, i) => i !== index));
    } else {
      setDealbreakers(dealbreakers.filter((_, i) => i !== index));
    }
  };

  const [draggedPrefIndex, setDraggedPrefIndex] = React.useState<number | null>(null);
  const [draggedDealIndex, setDraggedDealIndex] = React.useState<number | null>(null);

  const handlePrefDragStart = (index: number) => setDraggedPrefIndex(index);
  const handlePrefDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPrefIndex === null || draggedPrefIndex === index) return;
    const newPrefs = [...preferences];
    const draggedItem = newPrefs[draggedPrefIndex];
    newPrefs.splice(draggedPrefIndex, 1);
    newPrefs.splice(index, 0, draggedItem);
    setPreferences(newPrefs);
    setDraggedPrefIndex(index);
  };

  const handleDealDragStart = (index: number) => setDraggedDealIndex(index);
  const handleDealDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedDealIndex === null || draggedDealIndex === index) return;
    const newDeals = [...dealbreakers];
    const draggedItem = newDeals[draggedDealIndex];
    newDeals.splice(draggedDealIndex, 1);
    newDeals.splice(index, 0, draggedItem);
    setDealbreakers(newDeals);
    setDraggedDealIndex(index);
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
    const value = parseFloat(e.target.value) || 0;
    form.setValue("budgetMax", Math.max(0, value), { shouldValidate: true });
  };

  // Dynamic CTA label
  const getCTALabel = () => {
    if (isPending) return "Publishing...";
    return "Publish";
  };

  const onSubmit = (values: RequestValues) => {
    console.log("=== onSubmit called ===");
    console.log("Form values:", values);
    setErrors({});
    setError(null);
    setIsEnhancedOpen(false); // Close modal on submit

    // Auto-generate description from preferences/dealbreakers (always, since description field was removed)
    const prefText = preferences.length > 0
      ? `Preferences: ${preferences.map(p => p.label).join(", ")}`
      : "";
    const dealText = dealbreakers.length > 0
      ? `Dealbreakers: ${dealbreakers.map(d => d.label).join(", ")}`
      : "";
    const description = [prefText, dealText].filter(Boolean).join(". ") || "Looking for the requested item.";
    console.log("Auto-generated description:", description);

    console.log("Proceeding to submit...");

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

      // Log what we're sending
      console.log("=== Form Submission Debug ===");
      console.log("Form values:", values);
      console.log("Auto-generated description:", description);
      console.log("Description length:", description.length);
      console.log("Preferences:", preferences);
      console.log("Dealbreakers:", dealbreakers);
      console.log("FormData entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      try {
        const res = await createRequestAction(formData);
        console.log("Server response:", res);
        console.log("Response has error?", !!res?.error);
        console.log("Response has fieldErrors?", !!res?.fieldErrors);

        if (res?.error) {
          console.error("Request creation error:", res.error);
          console.error("Field errors:", res.fieldErrors);
          setError(res.error);
          // If there are field-specific errors, set them
          if (res.fieldErrors) {
            console.log("Setting field errors:", res.fieldErrors);
            setErrors(res.fieldErrors);
          } else {
            // Try to parse field errors from the error message
            const fieldErrorMatch = res.error.match(/(\w+):\s*(.+?)(?:\.|$)/g);
            if (fieldErrorMatch) {
              console.log("Parsing field errors from error message:", fieldErrorMatch);
              const parsedErrors: Record<string, string> = {};
              fieldErrorMatch.forEach((match: string) => {
                const parsed = match.match(/(\w+):\s*(.+?)(?:\.|$)/);
                if (parsed && parsed[1] && parsed[2]) {
                  parsedErrors[parsed[1]] = parsed[2].trim();
                }
              });
              if (Object.keys(parsedErrors).length > 0) {
                console.log("Parsed errors:", parsedErrors);
                setErrors(parsedErrors);
              }
            }
          }
          return;
        } else {
          console.log("Request created successfully! Response:", res);
          if (onSuccess) {
            // Request was created successfully (redirect will happen, but call onSuccess to close modal)
            onSuccess();
          }
          // Note: createRequestAction redirects on success, so this code may not execute
          router.refresh();
        }
      } catch (err) {
        console.error("Unexpected error during request creation:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    });
  };

  // Check if there are any validation errors
  const hasValidationErrors = Object.keys(errors).length > 0 || error !== null;

  // Debug: Log current error state
  React.useEffect(() => {
    if (hasValidationErrors) {
      console.log("=== Error State Debug ===");
      console.log("error state:", error);
      console.log("errors object:", errors);
      console.log("hasValidationErrors:", hasValidationErrors);
    }
  }, [error, errors, hasValidationErrors]);

  // Also log form errors from react-hook-form
  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("React Hook Form errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  // Construct preview data
  const previewRequest: RequestItem = {
    id: "preview",
    user_id: "preview",
    title: titleValue || "Your Request Title",
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

  // Log whenever country changes or arrives
  React.useEffect(() => {
    if (userCountry || form.watch("country")) {
      console.log("=== Country Debug ===");
      console.log("Prop userCountry:", userCountry);
      console.log("Form country value:", form.getValues("country"));
      console.log("Initial defaultCountry used:", userCountry || "");
    }
  }, [form.watch("country"), userCountry]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
      <div className="lg:col-span-2 lg:border-r border-[#e5e7eb] pr-12 pb-24">
        {/* Step-by-Step Navigation - Hidden as requested */}
        <div className="hidden mb-12">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200 -z-10" />
            {steps.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="relative flex flex-col items-center bg-background px-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 z-10",
                    isActive || isCompleted ? "bg-[#7755FF] text-white border-[#7755FF]" : "bg-white text-gray-400 border-gray-200"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={cn(
                    "absolute top-12 text-xs font-semibold whitespace-nowrap hidden sm:block",
                    isActive || isCompleted ? "text-foreground" : "text-gray-400"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={form.handleSubmit(
            (data) => {
              console.log("React Hook Form validation passed, calling onSubmit");
              onSubmit(data);
            },
            (errors) => {
              console.log("React Hook Form validation failed:", errors);
              // Convert react-hook-form errors to our format
              const formErrors: Record<string, string> = {};
              Object.entries(errors).forEach(([key, value]) => {
                if (value && typeof value === 'object' && 'message' in value) {
                  formErrors[key] = value.message as string;
                }
              });
              if (Object.keys(formErrors).length > 0) {
                setErrors(formErrors);
              }
            }
          )}
          className="space-y-12"
          noValidate
        >
          {/* SECTION 1: What are you looking for? */}
          {currentStep === 1 && (
            <section className="space-y-6">
  <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                    Create a new request
                  </h1>
                  <p className="text-gray-500">Fast, simple, and exactly what you need.</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEnhancedOpen(true)}
                  className="rounded-full px-8 h-12 font-medium border transition-all hover:bg-[#222234] hover:text-white hover:border-[#222234]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance
                </Button>
              </div>

              {/* What type of item? (Category) - Now First */}
              <div className="space-y-2">
                <Label>What type of item? (e.g. Watch, Car, Laptop)</Label>
                <CategoryCombobox
                  value={form.watch("category") || ""}
                  onChange={(value) => {
                    form.setValue("category", value);
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  placeholder="Search or type item type..."
                  className="placeholder:text-gray-400"
                />
                {form.formState.errors.category && (
                  <p className="text-xs text-red-600 font-medium mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              {/* Title - Now Second */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">The item</Label>
                  <span className={cn(
                    "text-xs text-gray-600",
                    titleLength > titleMaxLength && "text-red-600"
                  )}>
                    {titleLength}/{titleMaxLength}
                  </span>
                </div>
                <Input
                  id="title"
                  placeholder="Rolex Submariner 126610LN"
                  {...form.register("title")}
                  className={cn(
                    "placeholder:text-gray-400",
                    form.formState.errors.title && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Preferences and Dealbreakers - Two Columns */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Preferences */}
                <div className="space-y-3">
                  <Label htmlFor="preferences">Preferences (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="preferences"
                      placeholder="e.g., Good Battery"
                      className="flex-1 placeholder:text-gray-400"
                      value={preferenceInput}
                      onChange={(e) => {
                        setPreferenceInput(e.target.value);
                        setPreferencesTab("preferences");
                        setErrors((prev) => ({ ...prev, preferences: "" }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && preferenceInput.trim()) {
                          e.preventDefault();
                          if (preferencesTab === "preferences") {
                            addPreferenceOrDealbreaker();
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-900 hover:text-gray-900 font-bold"
                      onClick={() => {
                        setPreferencesTab("preferences");
                        addPreferenceOrDealbreaker();
                      }}
                      disabled={!preferenceInput.trim() || preferences.length >= 10}
                    >
                      Add
                    </Button>
                  </div>
                  {preferences.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {preferences.map((item, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handlePrefDragStart(index)}
                          onDragOver={(e) => handlePrefDragOver(e, index)}
                          onDragEnd={() => setDraggedPrefIndex(null)}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 rounded-lg border border-[#e5e7eb] bg-[#F5F6F9] text-sm transition-all",
                            draggedPrefIndex === index && "opacity-50 cursor-move"
                          )}
                        >
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-move opacity-50 group-hover:opacity-100" />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-lime-500 font-bold">+</span>
                            <span>{item.label}</span>
                            {item.note && (
                              <span className="text-xs text-gray-500">({item.note})</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePreferenceOrDealbreaker(index, "preferences")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dealbreakers */}
                <div className="space-y-3">
                  <Label htmlFor="dealbreakers">Dealbreakers (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dealbreakers"
                      placeholder="e.g., No defects"
                      className="flex-1 placeholder:text-gray-400"
                      value={dealbreakerInput}
                      onChange={(e) => {
                        setDealbreakerInput(e.target.value);
                        setPreferencesTab("dealbreakers");
                        setErrors((prev) => ({ ...prev, dealbreakers: "" }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && dealbreakerInput.trim()) {
                          e.preventDefault();
                          if (preferencesTab === "dealbreakers") {
                            addPreferenceOrDealbreaker();
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-900 hover:text-gray-900 font-bold"
                      onClick={() => {
                        setPreferencesTab("dealbreakers");
                        addPreferenceOrDealbreaker();
                      }}
                      disabled={!dealbreakerInput.trim() || dealbreakers.length >= 10}
                    >
                      Add
                    </Button>
                  </div>
                  {dealbreakers.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {dealbreakers.map((item, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDealDragStart(index)}
                          onDragOver={(e) => handleDealDragOver(e, index)}
                          onDragEnd={() => setDraggedDealIndex(null)}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 rounded-lg border border-[#e5e7eb] bg-[#F5F6F9] text-sm transition-all",
                            draggedDealIndex === index && "opacity-50 cursor-move"
                          )}
                        >
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-move opacity-50 group-hover:opacity-100" />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-[#FF5F00] font-bold">-</span>
                            <span>{item.label}</span>
                            {item.note && (
                              <span className="text-xs text-gray-500">({item.note})</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removePreferenceOrDealbreaker(index, "dealbreakers")}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: Constraints (Optional) */}
          {currentStep === 2 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Constraints</h2>
                  <p className="text-sm text-gray-600">Optional filters to help find better matches</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEnhancedOpen(true)}
                  className="rounded-full px-8 h-12 font-medium border transition-all hover:bg-[#222234] hover:text-white hover:border-[#222234]"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance
                </Button>
              </div>

              {/* Budget First */}
              <div className="space-y-4 p-4 rounded-lg border border-[#e5e7eb]/30">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Budget</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-gray-600 hover:text-foreground">
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set your maximum budget. Submissions above this amount won't be shown.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-4">
                  <Slider
                    value={[budgetMax]}
                    onValueChange={handleBudgetChange}
                    min={0}
                    max={5000}
                    step={10}
                    className="w-full"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="budgetMax" className="text-xs text-gray-600">Max ($)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      step="10"
                      min={0}
                      value={budgetMax}
                      onChange={handleBudgetMaxChange}
                      className={cn(
                        "h-9 placeholder:text-gray-400",
                        form.formState.errors.budgetMax && "border-red-500"
                      )}
                    />
                  </div>
                </div>
                {form.formState.errors.budgetMax && (
                  <p className="text-xs text-red-600 font-medium mt-1">{form.formState.errors.budgetMax.message}</p>
                )}

                {/* Lock Price Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      Lock price
                    </Label>
                    <p className="text-xs text-gray-600">
                      Proposals above your budget won’t be accepted
                    </p>
                  </div>
                  <Switch
                    checked={priceLock === "locked"}
                    onCheckedChange={(checked) => {
                      form.setValue("priceLock", checked ? "locked" : "open");
                    }}
                  />
                </div>
              </div>

              {/* Condition Second - New Style */}
              <div className="space-y-4 p-4 rounded-lg border border-[#e5e7eb]/30">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Condition</Label>
                </div>
                <div className="flex flex-row gap-2 w-full">
                  {["New", "Used", "Either"].map((option) => {
                    const isSelected = form.watch("condition") === option;
                    return (
                      <Button
                        key={option}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "flex-1 px-4 rounded-lg border h-10 transition-all font-medium",
                          isSelected 
                            ? "bg-[#222234] text-white border-[#222234] hover:bg-[#2a2a3f]" 
                            : "border-gray-200 hover:border-[#222234] hover:text-[#222234] hover:bg-white text-gray-600"
                        )}
                        onClick={() => form.setValue("condition", option)}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Urgency Last - Condition Style */}
              <div className="space-y-4 p-4 rounded-lg border border-[#e5e7eb]/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <Label className="text-base font-semibold">Urgency</Label>
                  <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex flex-row gap-2 w-full">
                  {["ASAP", "This week", "Standard"].map((option) => {
                    const isSelected = (form.watch("urgency") || "Standard") === option;
                    return (
                      <Button
                        key={option}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "flex-1 px-4 rounded-lg border h-10 transition-all font-medium",
                          isSelected 
                            ? "bg-[#222234] text-white border-[#222234] hover:bg-[#2a2a3f]" 
                            : "border-gray-200 hover:border-[#222234] hover:text-[#222234] hover:bg-white text-gray-600"
                        )}
                        onClick={() => form.setValue("urgency", option)}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>


              {/* Advanced Matching Rules - Boxed Radio Style */}
              <div className="space-y-4 p-4 rounded-lg border border-[#e5e7eb]/30">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold text-[#222234]">Advanced Matching</Label>
                </div>
                
                <div className="space-y-6">
                  {/* Exact Only vs Exact + Similar */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Item specificity</Label>
                    <div className="flex flex-row gap-2 w-full">
                      {[
                        { label: "Exact only", value: true },
                        { label: "Exact + similar", value: false }
                      ].map((option) => {
                        const isSelected = form.watch("exactItem") === option.value;
                        return (
                          <Button
                            key={option.label}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "flex-1 px-4 rounded-lg border h-10 transition-all font-medium",
                              isSelected 
                                ? "bg-[#222234] text-white border-[#222234] hover:bg-[#2a2a3f]" 
                                : "border-gray-200 hover:border-[#222234] hover:text-[#222234] hover:bg-white text-gray-600"
                            )}
                            onClick={() => form.setValue("exactItem", option.value)}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* No Alternatives Allowed Switch */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="exactSpecification" className="text-sm font-medium">
                        Strict requirements
                      </Label>
                      <p className="text-xs text-gray-600">
                        Item must match all specified preferences exactly
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
                </div>
              </div>
            </section>
          )}

          <Dialog open={isEnhancedOpen} onOpenChange={setIsEnhancedOpen}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
              <DialogHeader className="p-8 bg-gray-50/50 border-b border-[#e5e7eb]/50">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-[#222234]" />
                  <DialogTitle className="text-2xl font-bold tracking-tight">References & visibility</DialogTitle>
                </div>
                <DialogDescription className="text-base text-gray-500">
                  Add more details to help sellers bring you exactly what you want.
                </DialogDescription>
              </DialogHeader>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Reference Links as Chips */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Reference links</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste URL and press Enter"
                      value={linkInput}
                      onChange={(e) => {
                        setLinkInput(e.target.value);
                        setErrors((prev) => ({ ...prev, linkInput: "" }));
                      }}
                      onKeyDown={handleLinkInputKeyDown}
                      onBlur={addLink}
                      className={cn(
                        "h-12 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400",
                        errors.linkInput && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLink}
                      className="shrink-0 h-12 w-12 rounded-xl border flex items-center justify-center"
                    >
                      <Plus className="h-7 w-7" />
                    </Button>
                  </div>
                  {errors.linkInput && (
                    <p className="text-xs text-red-600 font-medium ml-1">{errors.linkInput}</p>
                  )}
                  {referenceLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {referenceLinks.map((link, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e5e7eb] bg-white text-sm shadow-sm transition-all hover:shadow-md"
                        >
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#222234] hover:underline truncate max-w-[240px] font-medium"
                          >
                            {link}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Upload with Drag & Drop */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Images</Label>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                      {uploadedImages.length}/5
                    </span>
                  </div>

                  <div
                    className={cn(
                      "relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300",
                      "hover:border-[#222234]/30 hover:bg-gray-50/50",
                      isUploading && "opacity-50 cursor-not-allowed",
                      uploadedImages.length >= 5 ? "border-gray-100 bg-gray-50/30" : "border-[#e5e7eb]"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      handleImageUpload(files);
                    }}
                  >
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      disabled={isUploading || uploadedImages.length >= 5}
                      className="hidden"
                    />
                    <label
                      htmlFor="images"
                      className={cn(
                        "flex flex-col items-center justify-center gap-4 cursor-pointer",
                        (isUploading || uploadedImages.length >= 5) && "cursor-not-allowed"
                      )}
                    >
                      <div className="h-12 w-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6 text-[#222234]" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-semibold text-[#222234]">
                          {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          High-quality images get 2x more offers
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Image Previews with Reorder */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 pt-2">
                      {uploadedImages.map((url, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 border-[#e5e7eb] bg-gray-100 group cursor-move shadow-sm hover:shadow-md transition-all",
                            draggedIndex === index && "opacity-50"
                          )}
                        >
                          <Image
                            src={url}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute top-1.5 left-1.5 p-1 bg-white/90 backdrop-blur rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-3.5 w-3.5 text-gray-600" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 border-t border-[#e5e7eb]/50 flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setIsEnhancedOpen(false)}
                  className="rounded-xl px-8 h-12 bg-[#222234] hover:bg-[#2a2a3f] text-white font-bold"
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>


          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between items-center mt-12 bg-transparent">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={goBack} className="w-full sm:w-auto h-12 px-8 rounded-full border-2 font-medium">
                Back
              </Button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {currentStep < 2 ? (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-400">1 / 2</span>
                <Button type="button" onClick={proceedToNextStep} className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#222234] hover:bg-[#2a2a3f] text-white font-medium shadow-sm transition-all hover:shadow whitespace-nowrap">
                  Next: Budget & Condition
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-400">2 / 2</span>
                <Button type="submit" variant="accent" className="w-full sm:w-auto h-12 px-8 rounded-full font-medium shadow-sm transition-all hover:shadow bg-[#222234] hover:bg-[#2a2a3f] text-white whitespace-nowrap" disabled={isPending}>
                  {getCTALabel()}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right Sidebar - Preview */}
      <div className="lg:col-span-1 hidden lg:block pl-12 h-fit sticky top-24">
        <div className="space-y-4 max-w-[460px]">
          <div className="flex items-center gap-2 text-foreground px-1">
            <Sparkles className="h-5 w-5 text-[#7755FF]" />
            <h3 className="text-lg font-semibold tracking-tight">Live Preview</h3>
          </div>
          
          <div className="pointer-events-none">
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
    </div>
  );
}

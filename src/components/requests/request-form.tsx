"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/layout/auth-provider";
import { AuthTabs } from "@/components/auth/auth-tabs";
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
import { Upload, X, GripVertical, Info, Plus, Check, Sparkles, Crown, LockKeyhole, MapPin, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MAIN_CATEGORIES, SUBCATEGORIES, type MainCategory } from "@/lib/categories";
import { RequestCard } from "@/components/requests/request-card";
import type { RequestItem } from "@/lib/types";

type RequestValues = z.infer<typeof requestSchema>;

export function RequestForm({ 
  onSuccess, 
  userCountry,
  isModal = false 
}: { 
  onSuccess?: () => void, 
  userCountry?: string | null,
  isModal?: boolean
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
  const [requirementInput, setRequirementInput] = React.useState("");
  const [requirementType, setRequirementType] = React.useState<"preference" | "dealbreaker">("preference");
  const [draggedType, setDraggedType] = React.useState<"preference" | "dealbreaker" | null>(null);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isEnhancedOpen, setIsEnhancedOpen] = React.useState(false);

  const steps = [
    { id: 1, title: 'Item & Info' },
    { id: 2, title: 'Constraints' },
    ...(!user ? [{ id: 3, title: 'Authenticate' }] : [])
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
      const maxStep = user ? 2 : 3;
      setCurrentStep((prev) => Math.min(prev + 1, maxStep));
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

  const onSubmit = async (values: RequestValues) => {
    if (currentStep === 1) {
      proceedToNextStep();
      return;
    }

    if (currentStep === 2 && !user) {
      proceedToNextStep();
      return;
    }

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
            // Request was created successfully (redirect will happen, but call onSuccess to close modal)
            onSuccess();
          }
          // Note: createRequestAction redirects on success, so this code may not execute
          router.refresh();
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

  return (
    <div className={cn(
      "grid grid-cols-1 gap-0 items-start",
      isModal ? "lg:grid-cols-1" : "lg:grid-cols-8"
    )}>
      <div className={cn(
        "pb-24",
        isModal ? "lg:col-span-1 pr-0" : "lg:col-span-5 lg:border-r border-[#e5e7eb] pr-12"
      )}>
        {/* Step-by-Step Navigation - Removed top stepper as per request */}

        <form
          onSubmit={form.handleSubmit(
            (data) => {
              onSubmit(data);
            },
            (errors) => {
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
          {/* Persistent Header */}
          {!isModal && (
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                  Create a new request
                </h1>
                <p className="text-gray-500">Fast, simple, and exactly what you need.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEnhancedOpen(true)}
                  className="rounded-full px-8 h-12 font-medium border transition-all hover:bg-[#222234] hover:text-white hover:border-[#222234]"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Media & Links
                  {(uploadedImages.length + referenceLinks.length) > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center">
                      {uploadedImages.length + referenceLinks.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* SECTION 1: What are you looking for? */}
          {currentStep === 1 && (
            <section className="space-y-6">

              {/* What are you looking for? (Category) - Clean Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    What exactly are you looking for? <span className="text-red-500">*</span>
                  </Label>
                </div>
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

              {/* Title - Clean Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-base font-semibold">
                    Name of the item <span className="text-red-500">*</span>
                  </Label>
                  <span className={cn(
                    "text-xs text-gray-600",
                    titleLength > titleMaxLength && "text-red-600"
                  )}>
                    {titleLength}/{titleMaxLength}
                  </span>
                </div>
                <Input
                  id="title"
                  placeholder="Brand, Model or specific SKU (e.g. Sony A7IV)"
                  {...form.register("title")}
                  className={cn(
                    "h-11 bg-white border-[#e5e7eb] rounded-lg focus-visible:ring-[#222234] placeholder:text-gray-400",
                    form.formState.errors.title && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Unified Requirements Section - Clean Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Requirements</Label>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a requirement..."
                        className="h-11 flex-1 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400"
                        value={requirementInput}
                        onChange={(e) => {
                          setRequirementInput(e.target.value);
                          setErrors((prev) => ({ ...prev, requirements: "" }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && requirementInput.trim()) {
                            setPreferences([...preferences, { label: requirementInput.trim() }]);
                            setRequirementInput("");
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (!requirementInput.trim()) return;
                          setPreferences([...preferences, { label: requirementInput.trim() }]);
                          setRequirementInput("");
                        }}
                        variant="outline"
                        className="flex-1 h-11 px-4 border-none bg-green-50 text-[#015a25] hover:bg-green-100/80 rounded-xl font-medium transition-all shadow-none"
                        disabled={!requirementInput.trim() || preferences.length >= 10}
                      >
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Add as Preference
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!requirementInput.trim()) return;
                          setDealbreakers([...dealbreakers, { label: requirementInput.trim() }]);
                          setRequirementInput("");
                        }}
                        variant="outline"
                        className="flex-1 h-11 px-4 border-none bg-amber-50 text-amber-700 hover:bg-amber-100/80 rounded-xl font-medium transition-all shadow-none"
                        disabled={!requirementInput.trim() || dealbreakers.length >= 10}
                      >
                        <X className="mr-2 h-4 w-4 text-amber-500" />
                        Add as Dealbreaker
                      </Button>
                    </div>
                  </div>

                  {/* Unified List with Subheaders */}
                  {(preferences.length > 0 || dealbreakers.length > 0) && (
                    <div className="space-y-6 pt-4 border-t border-[#e5e7eb]/50 mt-4">
                      {/* Render Preferences */}
                      {preferences.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold tracking-wider text-gray-400 ml-1">Preferences</h4>
                          <div className="space-y-2">
                            {preferences.map((item, index) => (
                              <div
                                key={`pref-${index}`}
                                draggable
                                onDragStart={() => {
                                  setDraggedIndex(index);
                                  setDraggedType("preference");
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (draggedIndex === null || draggedType === null) return;
                                  
                                  if (draggedType === "preference") {
                                    if (draggedIndex === index) return;
                                    const newPrefs = [...preferences];
                                    const draggedItem = newPrefs[draggedIndex];
                                    newPrefs.splice(draggedIndex, 1);
                                    newPrefs.splice(index, 0, draggedItem);
                                    setPreferences(newPrefs);
                                    setDraggedIndex(index);
                                  } else {
                                    // Move from dealbreakers to preferences
                                    const dealbreakerItem = dealbreakers[draggedIndex];
                                    if (!dealbreakerItem) return;
                                    
                                    const newDeals = dealbreakers.filter((_, i) => i !== draggedIndex);
                                    const newPrefs = [...preferences];
                                    newPrefs.splice(index, 0, dealbreakerItem);
                                    
                                    setDealbreakers(newDeals);
                                    setPreferences(newPrefs);
                                    setDraggedType("preference");
                                    setDraggedIndex(index);
                                  }
                                }}
                                onDragEnd={() => {
                                  setDraggedIndex(null);
                                  setDraggedType(null);
                                }}
                                className={cn(
                                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#e5e7eb]/50 bg-white hover:border-[#222234]/20 transition-all",
                                  draggedIndex === index && "opacity-50 cursor-move"
                                )}
                              >
                                <GripVertical className="h-4 w-4 text-gray-300 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex-1 flex items-center gap-3">
                                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-50">
                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                  </div>
                                  <span className="text-sm text-gray-700">{item.label}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPreferences(preferences.filter((_, i) => i !== index))}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Render Dealbreakers */}
                      {dealbreakers.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold tracking-wider text-gray-400 ml-1">Dealbreakers</h4>
                          <div className="space-y-2">
                            {dealbreakers.map((item, index) => (
                              <div
                                key={`deal-${index}`}
                                draggable
                                onDragStart={() => {
                                  setDraggedIndex(index);
                                  setDraggedType("dealbreaker");
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (draggedIndex === null || draggedType === null) return;
                                  
                                  if (draggedType === "dealbreaker") {
                                    if (draggedIndex === index) return;
                                    const newDeals = [...dealbreakers];
                                    const draggedItem = newDeals[draggedIndex];
                                    newDeals.splice(draggedIndex, 1);
                                    newDeals.splice(index, 0, draggedItem);
                                    setDealbreakers(newDeals);
                                    setDraggedIndex(index);
                                  } else {
                                    // Move from preferences to dealbreakers
                                    const preferenceItem = preferences[draggedIndex];
                                    if (!preferenceItem) return;
                                    
                                    const newPrefs = preferences.filter((_, i) => i !== draggedIndex);
                                    const newDeals = [...dealbreakers];
                                    newDeals.splice(index, 0, preferenceItem);
                                    
                                    setPreferences(newPrefs);
                                    setDealbreakers(newDeals);
                                    setDraggedType("dealbreaker");
                                    setDraggedIndex(index);
                                  }
                                }}
                                onDragEnd={() => {
                                  setDraggedIndex(null);
                                  setDraggedType(null);
                                }}
                                className={cn(
                                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#e5e7eb]/50 bg-white hover:border-[#222234]/20 transition-all",
                                  draggedIndex === index && "opacity-50 cursor-move"
                                )}
                              >
                                <GripVertical className="h-4 w-4 text-gray-300 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex-1 flex items-center gap-3">
                                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-50">
                                    <X className="h-3.5 w-3.5 text-[#FF5F00]" />
                                  </div>
                                  <span className="text-sm text-gray-700">{item.label}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDealbreakers(dealbreakers.filter((_, i) => i !== index))}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Step 3: Authentication (Only for Guests) */}
          {currentStep === 3 && !user && (
            <div className="max-w-md mx-auto py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-expanded)' }}>Almost there!</h2>
                <p className="text-gray-500">Sign in or create an account to publish your request and start receiving offers.</p>
              </div>
              <AuthTabs 
                onSuccess={() => {
                  // Success is handled by useAuth re-render and onSubmit auto-trigger
                }} 
              />
            </div>
          )}

          {/* SECTION 2: Constraints */}
          {currentStep === 2 && (
            <section className="space-y-6">

              {/* Budget First - Clean Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Budget <span className="text-red-500">*</span>
                  </Label>
                </div>

                <div className="space-y-4 pt-2">
                  <Input
                    id="budgetMax"
                    type="number"
                    step="10"
                    min={0}
                    value={budgetMax}
                    onChange={handleBudgetMaxChange}
                    placeholder="Enter your maximum budget"
                    className={cn(
                      "h-12 bg-white border-[#e5e7eb] rounded-lg focus-visible:ring-[#222234] placeholder:text-gray-400 text-base font-medium",
                      form.formState.errors.budgetMax && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                </div>
                {(form.formState.isSubmitted || form.formState.submitCount > 0) && form.formState.errors.budgetMax && (
                  <p className="text-xs text-red-600 font-medium mt-1">{form.formState.errors.budgetMax.message}</p>
                )}

                {/* Lock price moved to Advanced */}
              </div>

              {/* Condition Second - Clean Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">Condition</Label>
                </div>
                <div className="flex flex-row gap-2 w-full">
                  {["Brand New", "Used"].map((option) => {
                    const currentValue = form.watch("condition");
                    const isNewSelected = currentValue === "New" || currentValue === "Either";
                    const isUsedSelected = currentValue === "Used" || currentValue === "Either";
                    const isSelected = option === "Brand New" ? isNewSelected : isUsedSelected;

                    const handleToggle = () => {
                      if (option === "Brand New") {
                        if (isNewSelected) {
                          if (!isUsedSelected) return; // Prevent deselecting last one
                          form.setValue("condition", "Used");
                        } else {
                          form.setValue("condition", isUsedSelected ? "Either" : "New");
                        }
                      } else {
                        if (isUsedSelected) {
                          if (!isNewSelected) return; // Prevent deselecting last one
                          form.setValue("condition", "New");
                        } else {
                          form.setValue("condition", isNewSelected ? "Either" : "Used");
                        }
                      }
                    };
                    return (
                      <Button
                        key={option}
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 px-4 rounded-lg border h-10 transition-all font-medium hover:bg-white",
                          isSelected 
                            ? "bg-white text-black border-black border-2 font-bold" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                        onClick={handleToggle}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>



              {/* Location Hidden for now */}
              {false && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Label className="text-base font-semibold">Location</Label>
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <CountryCombobox
                    value={form.watch("country") || ""}
                    onChange={(value) => form.setValue("country", value)}
                    className="w-full"
                  />
                </div>
              )}


              {/* Advanced Matching Rules - Collapsible Section */}
              <div className="rounded-lg border border-[#e5e7eb]/30">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced-matching" className="border-none">
                    <AccordionTrigger className="px-4 py-4 hover:no-underline">
                      <Label className="text-base font-semibold text-[#222234] cursor-pointer">Advanced</Label>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-6 space-y-8">
                      <div className="space-y-8">
                        {/* Lock price moved here */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <Label className="text-base font-semibold flex items-center gap-1.5">
                              Lock price
                            </Label>
                            <p className="text-sm text-gray-500">
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

                        {/* Urgency moved here */}
                        <div className="space-y-4">
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
                                  variant="outline"
                                  className={cn(
                                    "flex-1 px-4 rounded-lg border h-10 transition-all font-medium hover:bg-white",
                                    isSelected 
                                      ? "bg-white text-black border-black border-2 font-bold" 
                                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                  )}
                                  onClick={() => form.setValue("urgency", option)}
                                >
                                  {option}
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Exact Only vs Exact + Similar - Toggle Version */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <Label className="text-base font-semibold">Exact match only</Label>
                            <p className="text-sm text-gray-500">
                              Only show items that match your title exactly, excluding similar models
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
                        <div className="flex items-center justify-between">
                          <div className="space-y-1 flex-1">
                            <Label htmlFor="exactSpecification" className="text-base font-semibold">
                              Strict requirements
                            </Label>
                            <p className="text-sm text-gray-500">
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </section>
          )}

          <Dialog open={isEnhancedOpen} onOpenChange={setIsEnhancedOpen}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
              <DialogHeader className="p-8 bg-gray-50/50 border-b border-[#e5e7eb]/50">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-[#222234]" />
                  <DialogTitle className="text-2xl font-bold tracking-tight">Media & Links</DialogTitle>
                </div>
                <DialogDescription className="text-base text-gray-500">
                  Share images and links to get better offers.
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
                      <Plus className="h-8 w-8" strokeWidth={2.5} />
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
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e5e7eb] bg-white text-sm transition-all"
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


          {/* Navigation Buttons - Fixed Bottom Layout */}
          <div className={cn(
            "flex items-center justify-between mt-12 bg-white",
            isModal && "sticky bottom-0 -mx-8 px-8 py-6 border-t border-gray-100 z-10"
          )}>
            <div className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase">
              Step {currentStep} of {user ? 2 : 3}
            </div>

            <div className="flex items-center gap-4">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goBack} 
                  className="h-12 w-12 rounded-full border-gray-200 p-0 flex items-center justify-center hover:bg-gray-50 bg-white"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </Button>
              )}

              {currentStep < (user ? 2 : 3) ? (
                <Button 
                  type="button" 
                  onClick={proceedToNextStep} 
                  className="h-12 px-10 rounded-full bg-[#222234] hover:bg-[#2a2a3f] text-white font-semibold text-base min-w-[140px] shadow-lg shadow-gray-200/50"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="accent" 
                  className="h-12 px-10 rounded-full font-semibold text-base min-w-[140px] shadow-lg shadow-gray-200/50 bg-[#222234] hover:bg-[#2a2a3f] text-white whitespace-nowrap" 
                  disabled={isPending}
                >
                  {getCTALabel()}
                </Button>
              )}
            </div>
          </div>
        </form>
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

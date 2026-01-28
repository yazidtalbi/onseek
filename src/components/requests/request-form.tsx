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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountryCombobox } from "@/components/ui/country-combobox";
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
import { Upload, X, GripVertical, Info, Plus } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MAIN_CATEGORIES, SUBCATEGORIES, type MainCategory } from "@/lib/categories";

type RequestValues = z.infer<typeof requestSchema>;

export function RequestForm({ onSuccess }: { onSuccess?: () => void }) {
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

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "Tech" as const,
      budgetMax: null,
      priceLock: "open",
      exactItem: false,
      exactSpecification: false,
      exactPrice: false,
      country: "",
      condition: "New",
      urgency: "Standard",
      referenceLinks: "",
    },
  });

  const titleValue = form.watch("title");
  const budgetMax = form.watch("budgetMax") || 1000;
  const priceLock = form.watch("priceLock");
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
    form.setValue("budgetMax", value[0]);
  };

  const handleBudgetMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    form.setValue("budgetMax", Math.max(0, value));
  };

  // Dynamic CTA label
  const getCTALabel = () => {
    if (isPending) return "Publishing...";
    if (priceLock === "locked") return "Publish locked request";
    if (urgency === "ASAP") return "Publish urgent request";
    return "Publish request";
  };

  const onSubmit = (values: RequestValues) => {
    console.log("=== onSubmit called ===");
    console.log("Form values:", values);
    console.log("Preferences:", preferences);
    console.log("Dealbreakers:", dealbreakers);
    
    // Collect validation errors
    const validationErrors: Record<string, string> = {};
    
    // Validate title
    console.log("Validating title:", values.title, "length:", values.title?.length);
    if (!values.title || values.title.trim().length < 4) {
      validationErrors.title = "Title must be at least 4 characters";
      console.log("Title validation failed: too short");
    }
    if (values.title && values.title.length > 120) {
      validationErrors.title = "Title must be less than 120 characters";
      console.log("Title validation failed: too long");
    }

    // Validate category
    console.log("Validating category:", values.category);
    if (!values.category || values.category.trim().length < 2) {
      validationErrors.category = "Please select a category";
      console.log("Category validation failed");
    }

    // Auto-generate description from preferences/dealbreakers (always, since description field was removed)
    const prefText = preferences.length > 0 
      ? `Preferences: ${preferences.map(p => p.label).join(", ")}` 
      : "";
    const dealText = dealbreakers.length > 0 
      ? `Dealbreakers: ${dealbreakers.map(d => d.label).join(", ")}` 
      : "";
    const description = [prefText, dealText].filter(Boolean).join(". ") || "Looking for the requested item.";
    console.log("Auto-generated description:", description);

    // Validate budget if provided
    if (values.budgetMax !== null && values.budgetMax !== undefined) {
      if (values.budgetMax < 0) {
        validationErrors.budgetMax = "Budget must be a positive number";
        console.log("Budget validation failed: negative");
      }
    }

    console.log("Validation errors found:", Object.keys(validationErrors).length, validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      console.error("Validation errors:", validationErrors);
      setErrors(validationErrors);
      setError(null); // Clear general error when showing field errors
      return;
    }
    
    console.log("Client-side validation passed, proceeding to submit...");

    setErrors({});
    setError(null);

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

  return (
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
            setError("Please fix the validation errors below");
          }
        }
      )} 
      className="space-y-12" 
      noValidate
    >
      {/* Error Banner at Top - Prevents Request Creation */}
      {hasValidationErrors && (
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 space-y-2 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Validation Error</span>
              </div>
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                Cannot publish request — please fix the following errors:
              </h3>
              <ul className="space-y-1.5 text-sm text-red-800">
                {/* Show general error */}
                {error && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                )}
                {/* Show field-specific errors */}
                {errors.title && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span><strong>Title:</strong> {errors.title}</span>
                  </li>
                )}
                {errors.category && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span><strong>Category:</strong> {errors.category}</span>
                  </li>
                )}
                {errors.budgetMax && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span><strong>Budget:</strong> {errors.budgetMax}</span>
                  </li>
                )}
                {/* Show any other field errors */}
                {Object.entries(errors).map(([key, value]) => {
                  if (!["title", "category", "description", "budgetMax", "preferences", "dealbreakers", "linkInput"].includes(key)) {
                    return (
                      <li key={key} className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</span>
                      </li>
                    );
                  }
                  return null;
                })}
                {/* Debug: Show if error exists but no errors object */}
                {error && Object.keys(errors).length === 0 && (
                  <li className="flex items-start gap-2 text-xs text-red-600 italic">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>Check browser console for detailed error information</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: What are you looking for? */}
      <section className="space-y-6">

        {/* Title */}
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
            placeholder="Casio W23"
            {...form.register("title")}
            className={cn(
              errors.title && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
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
                className="flex-1"
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
              <div className="flex flex-wrap gap-2">
                {preferences.map((item, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-[#F5F6F9] text-sm"
                  >
                    <span className="text-lime-500">+</span>
                    <span>{item.label}</span>
                    {item.note && (
                      <span className="text-xs text-gray-500">({item.note})</span>
                    )}
              <button
                type="button"
                      onClick={() => removePreferenceOrDealbreaker(index, "preferences")}
                      className="text-gray-600 hover:text-foreground ml-1"
              >
                      <X className="h-3 w-3" />
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
                className="flex-1"
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
              <div className="flex flex-wrap gap-2">
                {dealbreakers.map((item, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-[#F5F6F9] text-sm"
                  >
                    <span className="text-[#FF5F00]">-</span>
                    <span>{item.label}</span>
                    {item.note && (
                      <span className="text-xs text-gray-500">({item.note})</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePreferenceOrDealbreaker(index, "dealbreakers")}
                      className="text-gray-600 hover:text-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
          )}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* SECTION 2: Constraints (Optional) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">Constraints</h2>
          <p className="text-sm text-gray-600">Optional filters to help find better matches</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.watch("category").split(" > ")[0] || ""}
              onValueChange={(value) => {
                form.setValue("category", value);
                setErrors((prev) => ({ ...prev, category: "" }));
              }}
            >
              <SelectTrigger className={cn(
                errors.category && "border-red-500 focus-visible:ring-red-500"
              )}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {MAIN_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Subcategory */}
          {form.watch("category") && SUBCATEGORIES[form.watch("category").split(" > ")[0] as MainCategory] && (
            <div className="space-y-2">
              <Label>Subcategory (Optional)</Label>
              <Select
                value={form.watch("category").includes(" > ") ? form.watch("category").split(" > ")[1] : "__NONE__"}
                onValueChange={(subcategory) => {
                  const mainCategory = form.watch("category").split(" > ")[0];
                  if (subcategory === "__NONE__") {
                    form.setValue("category", mainCategory);
                  } else {
                    form.setValue("category", `${mainCategory} > ${subcategory}`);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">None</SelectItem>
                  {SUBCATEGORIES[form.watch("category").split(" > ")[0] as MainCategory]?.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Condition */}
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select
              value={form.watch("condition") || "New"}
              onValueChange={(value) => form.setValue("condition", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {["New", "Used", "Either"].map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label>Urgency</Label>
            <Select
              value={form.watch("urgency") || "Standard"}
              onValueChange={(value) => form.setValue("urgency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                {["ASAP", "This week", "Standard"].map((urgency) => (
                  <SelectItem key={urgency} value={urgency}>
                    {urgency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="country">Country</Label>
            <CountryCombobox
              value={form.watch("country") || null}
              onChange={(value) => form.setValue("country", value || null)}
              placeholder="Select or type country"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-4 p-4 rounded-lg border border-[#e5e7eb] /30">
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
                className="h-9"
              />
            </div>
          </div>

          {/* Lock Price Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e5e7eb]">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm font-medium">Lock price</Label>
              <p className="text-xs text-gray-600">
                Submissions above your max budget will be blocked
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


        {/* Advanced Matching Rules - Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced" className="border border-[#e5e7eb] rounded-lg bg-gray-50">
            <AccordionTrigger className="px-4">Advanced matching rules</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="exactItem" className="text-sm font-medium">
                    Only this exact item
                  </Label>
                  <p className="text-xs text-gray-600">
                    No alternatives allowed
                  </p>
                </div>
                <Switch
                  id="exactItem"
                  checked={form.watch("exactItem")}
                  onCheckedChange={(checked) => {
                    form.setValue("exactItem", checked);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="exactSpecification" className="text-sm font-medium">
                    No alternatives allowed
                  </Label>
                  <p className="text-xs text-gray-600">
                    Item must match all specified requirements exactly
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* SECTION 3: References & Visibility */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">References & visibility</h2>
          <p className="text-sm text-gray-600">Help others understand what you're looking for</p>
        </div>

        {/* Reference Links as Chips */}
        <div className="space-y-3">
          <Label>Reference links</Label>
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
                errors.linkInput && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addLink}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.linkInput && (
            <p className="text-xs text-red-600">{errors.linkInput}</p>
          )}
          {referenceLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {referenceLinks.map((link, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb]  text-sm"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:underline truncate max-w-[200px]"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="text-gray-600 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Upload with Drag & Drop */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="images">Images</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-gray-600 hover:text-foreground">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add images to help others understand what you're looking for. Max 5 images, 5MB each.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-6 transition-colors",
              "hover:border-foreground/30",
              isUploading && "opacity-50 cursor-not-allowed"
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
                "flex flex-col items-center justify-center gap-2 cursor-pointer",
                (isUploading || uploadedImages.length >= 5) && "cursor-not-allowed"
              )}
            >
              <Upload className="h-8 w-8 text-gray-600" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isUploading ? "Uploading..." : "Drag & drop images or click to browse"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {uploadedImages.length}/5 images • Max 5MB each
                </p>
              </div>
            </label>
          </div>

          {/* Image Previews with Reorder */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-5 gap-3">
              {uploadedImages.map((url, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-100 group cursor-move",
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
                  <div className="absolute top-1 left-1 p-1 rounded /80 border border-[#e5e7eb] opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-3 w-3 text-gray-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full /80 hover: border border-[#e5e7eb] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Error Summary */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button - Sticky on Mobile */}
      <div className="sticky bottom-0 left-0 right-0 z-10  border-t border-[#e5e7eb] p-4 -mx-4 md:static md:border-t-0 md:p-0 md:mx-0 flex justify-end">
        <Button type="submit" variant="accent" className="w-full md:w-auto md:min-w-[200px]" disabled={isPending}>
          {getCTALabel()}
        </Button>
      </div>
    </form>
  );
}

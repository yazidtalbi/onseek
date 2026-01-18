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

// Helper chips for description
const HELPER_CHIPS = [
  { label: "Brand preference", text: "Brand: " },
  { label: "Size / dimensions", text: "Size: " },
  { label: "Must-have features", text: "Must have: " },
  { label: "Deal breakers", text: "Deal breakers: " },
] as const;

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

  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "Tech" as const,
      budgetMin: null,
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
  const descriptionValue = form.watch("description");
  const budgetMin = form.watch("budgetMin") || 0;
  const budgetMax = form.watch("budgetMax") || 1000;
  const priceLock = form.watch("priceLock");
  const urgency = form.watch("urgency");

  // Character counter for title
  const titleLength = titleValue.length;
  const titleMaxLength = 120;

  // Insert helper chip text into description
  const insertHelperText = (text: string) => {
    const currentDesc = descriptionValue || "";
    const textarea = document.getElementById("description") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = currentDesc.slice(0, start) + text + currentDesc.slice(end);
      form.setValue("description", newText);
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

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

  // Budget slider handlers
  const handleBudgetChange = (values: number[]) => {
    form.setValue("budgetMin", values[0]);
    form.setValue("budgetMax", values[1]);
  };

  const handleBudgetMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const max = form.watch("budgetMax") || 1000;
    form.setValue("budgetMin", Math.min(value, max));
  };

  const handleBudgetMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 1000;
    const min = form.watch("budgetMin") || 0;
    form.setValue("budgetMax", Math.max(value, min));
  };

  // Dynamic CTA label
  const getCTALabel = () => {
    if (isPending) return "Publishing...";
    if (priceLock === "locked") return "Publish locked request";
    if (urgency === "ASAP") return "Publish urgent request";
    return "Publish request";
  };

  const onSubmit = (values: RequestValues) => {
    // Collect validation errors
    const validationErrors: Record<string, string> = {};
    if (!values.title || values.title.length < 4) {
      validationErrors.title = "Title must be at least 4 characters";
    }
    if (!values.description || values.description.length < 10) {
      validationErrors.description = "Description must be at least 10 characters";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("category", values.category);
    formData.set(
      "budgetMin",
      Number.isFinite(values.budgetMin) ? String(values.budgetMin) : ""
    );
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

    // Add image URLs
    uploadedImages.forEach((url) => {
      formData.append("imageUrls", url);
    });

    startTransition(async () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      
      const res = await createRequestAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (onSuccess) {
        // Request was created successfully (redirect will happen, but call onSuccess to close modal)
        onSuccess();
      }
      // Note: createRequestAction redirects on success, so this code may not execute
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12" noValidate>
      {/* SECTION 1: What are you looking for? */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1">What are you looking for?</h2>
          <p className="text-sm text-gray-600">Describe your request clearly</p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">Title</Label>
            <span className={cn(
              "text-xs text-gray-600",
              titleLength > titleMaxLength && "text-red-600"
            )}>
              {titleLength}/{titleMaxLength}
            </span>
          </div>
          <Input
            id="title"
            placeholder="Wireless vacuum cleaner under $150"
            {...form.register("title")}
            className={cn(
              errors.title && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description with helper chips */}
        <div className="space-y-3">
          <Label htmlFor="description">Description</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {HELPER_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => insertHelperText(chip.text)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-[#e5e7eb] bg-white hover:bg-gray-100 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
          <Textarea
            id="description"
            placeholder="Add details about what you're looking for..."
            rows={6}
            {...form.register("description")}
            className={cn(
              errors.description && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description}</p>
          )}
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
              }}
            >
              <SelectTrigger>
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

        {/* Budget with Range Slider */}
        <div className="space-y-4 p-4 rounded-lg border border-[#e5e7eb] bg-white/30">
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
                  <p>Set your budget range. Submissions outside this range won't be shown.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            <Slider
              value={[budgetMin, budgetMax]}
              onValueChange={handleBudgetChange}
              min={0}
              max={5000}
              step={10}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="budgetMin" className="text-xs text-gray-600">Min ($)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  step="10"
                  min={0}
                  value={budgetMin}
                  onChange={handleBudgetMinChange}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="budgetMax" className="text-xs text-gray-600">Max ($)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  step="10"
                  min={budgetMin}
                  value={budgetMax}
                  onChange={handleBudgetMaxChange}
                  className="h-9"
                />
              </div>
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="exactPrice" className="text-sm font-medium">
                    Must match budget exactly
                  </Label>
                  <p className="text-xs text-gray-600">
                    Price must match the specified budget exactly
                  </p>
                </div>
                <Switch
                  id="exactPrice"
                  checked={form.watch("exactPrice")}
                  onCheckedChange={(checked) => {
                    form.setValue("exactPrice", checked);
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
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#e5e7eb] bg-white text-sm"
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
                  <div className="absolute top-1 left-1 p-1 rounded bg-white/80 border border-[#e5e7eb] opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-3 w-3 text-gray-600" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white/80 hover:bg-white border border-[#e5e7eb] opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-white border-t border-[#e5e7eb] p-4 -mx-4 md:static md:border-t-0 md:p-0 md:mx-0">
        <Button type="submit" variant="accent" className="w-full md:w-auto md:min-w-[200px]" disabled={isPending}>
          {getCTALabel()}
        </Button>
      </div>
    </form>
  );
}

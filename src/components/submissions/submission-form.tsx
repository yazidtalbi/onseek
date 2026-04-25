"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { submissionSchema } from "@/lib/validators";
import { createSubmissionAction } from "@/actions/submission.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Upload, ZoomIn, X, FilePlus } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/layout/auth-provider";
import { getSavedPersonalItemsAction, savePersonalItemAction } from "@/actions/saved-items.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { MAIN_CATEGORIES } from "@/lib/categories";

type Values = z.infer<typeof submissionSchema>;

export function SubmissionForm({
  requestId,
  requestBudgetMax,
  requestDescription,
  hideButton = false,
  requestPreferences = [],
  requestDealbreakers = []
}: {
  requestId: string;
  requestBudgetMax?: number | null;
  requestDescription?: string;
  hideButton?: boolean;
  requestPreferences?: any[];
  requestDealbreakers?: any[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState(false);
  const [urlFetchAttempted, setUrlFetchAttempted] = React.useState(false);
  const [urlFetchCompleted, setUrlFetchCompleted] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = React.useState<File | null>(null);
  const [zoomImage, setZoomImage] = React.useState<string | null>(null);
  const [savedItems, setSavedItems] = React.useState<any[]>([]);
  const [isLoadingSavedItems, setIsLoadingSavedItems] = React.useState(false);
  const [saveItem, setSaveItem] = React.useState(true); // Checked by default for personal items
  const [metCriteria, setMetCriteria] = React.useState<string[]>([]);
  const form = useForm<Values>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      submissionType: "link",
      url: "",
      articleName: "",
      price: null,
      priceSuffix: "total",
      category: "TECH",
      notes: "",
    },
  });

  const toggleCriterion = (item: any) => {
    const label = typeof item === 'string' ? item : item.label;
    if (!label) return;

    setMetCriteria(prev =>
      prev.includes(label)
        ? prev.filter(c => c !== label)
        : [...prev, label]
    );
  };

  const totalCriteria = requestPreferences.length + requestDealbreakers.length;
  const metCount = metCriteria.length;

  const submissionType = form.watch("submissionType");
  const url = form.watch("url");

  // Load saved items when modal opens and user selects personal item type
  React.useEffect(() => {
    if (isExpanded && submissionType === "personal" && user) {
      loadSavedItems();
    }
  }, [isExpanded, submissionType, user]);

  const loadSavedItems = async () => {
    setIsLoadingSavedItems(true);
    try {
      const result = await getSavedPersonalItemsAction();
      if (result.data) {
        setSavedItems(result.data);
      }
    } catch (err) {
      console.error("Error loading saved items:", err);
    } finally {
      setIsLoadingSavedItems(false);
    }
  };

  const handleSelectSavedItem = (itemId: string) => {
    const item = savedItems.find((i) => i.id === itemId);
    if (item) {
      form.setValue("articleName", item.article_name || "");
      form.setValue("price", item.price || null);
      form.setValue("priceSuffix", item.price_suffix || "");
      form.setValue("category", item.category || "TECH");
      form.setValue("notes", item.description || "");
      if (item.image_url) {
        setUploadedImage(item.image_url);
        setUploadedImageFile(null); // We don't have the file, just the URL
      }
    }
  };

  // Clear preview when switching submission type
  React.useEffect(() => {
    if (submissionType !== "link") {
      setPreviewImage(null);
      setImageError(false);
      setUrlFetchAttempted(false);
      setUrlFetchCompleted(false);
      setSaveItem(true); // Enable save checkbox by default for personal items
    } else {
      // Reset fetch state when switching back to link
      if (!url) {
        setUrlFetchAttempted(false);
        setUrlFetchCompleted(false);
      }
      setSaveItem(false); // Disable save checkbox for link submissions
    }
  }, [submissionType, url]);

  // Fetch article name and preview when URL changes (only for link submissions)
  React.useEffect(() => {
    if (!url || submissionType !== "link") {
      setPreviewImage(null);
      setImageError(false);
      return;
    }

    // Validate URL format
    let validUrl: string;
    try {
      new URL(url);
      validUrl = url;
    } catch {
      return; // Invalid URL, don't fetch
    }

    // Don't fetch if URL is just "http://" or similar incomplete URLs
    if (!validUrl || validUrl.length < 10) {
      return;
    }

    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      setImageError(false);
      setUrlFetchAttempted(true);
      setUrlFetchCompleted(false);
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(validUrl)}`);
        const data = await response.json();

        if (data.imageUrl) {
          setPreviewImage(data.imageUrl);
        }

        if (data.articleName) {
          const currentArticleName = form.getValues("articleName");
          // Only auto-populate if article name is empty
          if (!currentArticleName || currentArticleName.trim() === "") {
            form.setValue("articleName", data.articleName);
          }
        }

        if (data.price) {
          const currentPrice = form.getValues("price");
          // Only auto-populate if price is empty
          if (!currentPrice || currentPrice === 0) {
            form.setValue("price", data.price);
          }
        }
        setUrlFetchCompleted(true);
      } catch (err) {
        console.error("Error fetching link preview:", err);
        toast({
          title: "Couldn't auto-fill link details",
          description: "We couldn't fetch details for this link. You can still enter them manually below.",
        });
        // Still mark as completed even on error - user can type manually
        setUrlFetchCompleted(true);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    // Debounce the fetch to avoid too many requests
    const timeoutId = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [url, submissionType, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsExpanded(false);
      form.reset();
      setError(null);
      setPreviewImage(null);
      setImageError(false);
      setUploadedImage(null);
      setUploadedImageFile(null);
      setUrlFetchAttempted(false);
      setUrlFetchCompleted(false);
      setMetCriteria([]);
    } else {
      if (!user) {
        // Redirect to login with return URL
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
        return;
      }
      setIsExpanded(true);
    }
  };

  // Expose global function to open modal for other components
  React.useEffect(() => {
    (window as any).openSubmissionModal = () => handleOpenChange(true);
    return () => {
      delete (window as any).openSubmissionModal;
    };
  }, [user, profile]);

  const onSubmit = async (values: Values) => {
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("submissionType", values.submissionType);
    // For personal items, use a placeholder URL
    formData.set("url", values.url || (values.submissionType === "personal" ? "personal-item" : ""));
    formData.set("articleName", values.articleName || "");
    formData.set(
      "price",
      Number.isFinite(values.price) ? String(values.price) : ""
    );
    formData.set("priceSuffix", values.priceSuffix === "total" ? "" : (values.priceSuffix || ""));
    formData.set("category", values.category || "");
    const criteriaText = metCriteria.length > 0
      ? `\n\nRequirements Met: ${metCriteria.join(", ")}`
      : "";
    formData.set("notes", (values.notes || "") + criteriaText);

    // Upload image first if it's a personal item submission
    if (uploadedImageFile && values.submissionType === "personal") {
      startTransition(async () => {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append("images", uploadedImageFile);

          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            setError(errorData.error || "Failed to upload image");
            return;
          }

          const uploadData = await uploadResponse.json();
          if (uploadData.urls && uploadData.urls.length > 0) {
            formData.set("imageUrl", uploadData.urls[0]);
          }

          // Now create the submission with the image URL
          const res = await createSubmissionAction(formData);
          setError(res?.error || null);
          if (!res?.error) {
            // Save item if checkbox is checked
            if (saveItem && values.articleName) {
              try {
                const saveFormData = new FormData();
                saveFormData.set("articleName", values.articleName);
                saveFormData.set("description", values.notes || "");
                saveFormData.set("price", values.price ? String(values.price) : "");
                saveFormData.set("priceSuffix", values.priceSuffix || "");
                saveFormData.set("category", values.category || "");
                if (uploadData.urls && uploadData.urls.length > 0) {
                  saveFormData.set("imageUrl", uploadData.urls[0]);
                }
                await savePersonalItemAction(saveFormData);
              } catch (err) {
                console.error("Error saving item:", err);
                // Don't fail the submission if save fails
              }
            }
            form.reset();
            handleOpenChange(false);
            setPreviewImage(null);
            setImageError(false);
            setUploadedImage(null);
            setUploadedImageFile(null);
            setUrlFetchAttempted(false);
            setUrlFetchCompleted(false);
            // Refresh server components to get updated data
            router.refresh();
          }
        } catch (err) {
          setError("Failed to upload image");
          console.error("Upload error:", err);
        }
      });
    } else {
      // No image upload needed, proceed directly
      startTransition(async () => {
        const res = await createSubmissionAction(formData);
        setError(res?.error || null);
        if (!res?.error) {
          // Save item if checkbox is checked and it's a personal item
          if (saveItem && values.submissionType === "personal" && values.articleName) {
            try {
              const saveFormData = new FormData();
              saveFormData.set("articleName", values.articleName);
              saveFormData.set("description", values.notes || "");
              saveFormData.set("price", values.price ? String(values.price) : "");
              saveFormData.set("priceSuffix", values.priceSuffix || "");
              saveFormData.set("category", values.category || "");
              // For personal items without new upload, check if we have an existing uploaded image URL
              if (uploadedImage && uploadedImage.startsWith("http")) {
                saveFormData.set("imageUrl", uploadedImage);
              }
              await savePersonalItemAction(saveFormData);
            } catch (err) {
              console.error("Error saving item:", err);
              // Don't fail the submission if save fails
            }
          }
          form.reset();
          handleOpenChange(false);
          setPreviewImage(null);
          setImageError(false);
          setUploadedImage(null);
          setUploadedImageFile(null);
          setUrlFetchAttempted(false);
          setUrlFetchCompleted(false);
          // Refresh server components to get updated data
          router.refresh();
        }
      });
    }
  };

  return (
    <>
      {!hideButton && (
        <div
          className="w-full hidden md:flex items-center gap-2.5 cursor-text transition-all duration-200"
          onClick={() => handleOpenChange(true)}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-400 relative">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username || "You"} className="w-full h-full object-cover" />
            ) : (
              (profile?.username?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U')
            )}
          </div>
          <span className="text-gray-400 text-[15px] font-medium flex-1">What are you offering..</span>
        </div>
      )}
      <Button
        type="button"
        id="submission-form-trigger"
        className="hidden"
        onClick={() => handleOpenChange(true)}
      >
        Submit proposal
      </Button>

      <Dialog open={isExpanded} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold">Submit proposal</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Proposal Type Selection */}
            <div className="flex gap-2">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                  submissionType === "link"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-transparent text-gray-400 hover:text-gray-600"
                )}
                onClick={() => form.setValue("submissionType", "link")}
              >
                Link
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                  submissionType === "personal"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-transparent text-gray-400 hover:text-gray-600"
                )}
                onClick={() => form.setValue("submissionType", "personal")}
              >
                Listing
              </button>
            </div>

            {/* URL field - only for link submissions */}
            {submissionType === "link" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="Product URL (Paste a link here...)"
                    className={cn(
                      "h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold",
                      form.formState.errors.url && "border-red-500 focus-visible:ring-red-500"
                    )}
                    {...form.register("url")}
                  />
                  {form.formState.errors.url && (
                    <p className="text-xs font-medium text-red-500 px-1">{form.formState.errors.url.message}</p>
                  )}
                </div>

                {/* Preview Image */}
                {previewImage && !imageError && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                    <Image
                      src={previewImage}
                      alt={form.watch("articleName") || "Product preview"}
                      fill
                      className="object-contain"
                      unoptimized
                      onError={() => {
                        setImageError(true);
                      }}
                    />
                  </div>
                )}
                {previewImage && imageError && (
                  <div className="w-full h-48 rounded-lg border border-border bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Preview unavailable</span>
                  </div>
                )}
              </div>
            )}

            {/* Personal items fields */}
            {submissionType === "personal" && (
              <div className="space-y-3">
                {/* Saved Items Selector */}
                {savedItems.length > 0 && (
                  <div className="space-y-2">
                    <Select onValueChange={handleSelectSavedItem}>
                      <SelectTrigger className="h-14 bg-white border-[#e5e7eb] rounded-xl focus:ring-[#222234]">
                        <SelectValue placeholder="Load from your listings (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.article_name} {item.price ? `- $${item.price}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Article name and Category Badge */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="articleName"
                      className={cn(
                        "h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold",
                        form.formState.errors.articleName && "border-red-500 focus-visible:ring-red-500"
                      )}
                      placeholder="Listing name (e.g., iPhone 15 Pro, Web Design...)"
                      {...form.register("articleName")}
                    />
                    {form.formState.errors.articleName && (
                      <p className="text-xs font-medium text-red-500 px-1 mt-1">{form.formState.errors.articleName.message}</p>
                    )}
                  </div>
                  <div className="w-[120px]">
                    <Select
                      value={form.watch("category") || "TECH"}
                      onValueChange={(val) => form.setValue("category", val)}
                    >
                      <SelectTrigger className="h-14 bg-white border-[#e5e7eb] rounded-xl focus:ring-[#222234] text-xs font-bold">
                        <SelectValue placeholder="Cat." />
                      </SelectTrigger>
                      <SelectContent>
                        {MAIN_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat.toUpperCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Image upload for personal items - second */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 cursor-pointer transition-colors text-sm font-medium"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload image or cover (optional)</span>
                    </label>
                  </div>
                  {uploadedImage && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center group">
                      <Image
                        src={uploadedImage}
                        alt="Uploaded item"
                        fill
                        className="object-contain cursor-zoom-in"
                        unoptimized
                        onClick={() => setZoomImage(uploadedImage)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadedImageFile(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-background/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description - third for personal items */}
                <div className="space-y-4">
                  {/* Criteria Checklist for Personal Items */}
                  {(requestPreferences.length > 0 || requestDealbreakers.length > 0) && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[14px] font-bold text-[#1A1A1A]">
                          Match Score
                        </Label>
                        <span className="text-[12px] font-bold text-[#7755FF] bg-[#7755FF]/10 px-2.5 py-1 rounded-full">
                          {metCount}/{totalCriteria} matched
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {requestPreferences.map((pref, idx) => {
                          const label = typeof pref === 'string' ? pref : pref.label;
                          return (
                            <button
                              key={`pref-${idx}`}
                              type="button"
                              onClick={() => toggleCriterion(pref)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1.5",
                                metCriteria.includes(label)
                                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                              )}
                            >
                              {metCriteria.includes(label) ? (
                                <Plus className="h-3 w-3 rotate-45" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                              {label}
                            </button>
                          );
                        })}
                        {requestDealbreakers.map((db, idx) => {
                          const label = typeof db === 'string' ? db : db.label;
                          return (
                            <button
                              key={`db-${idx}`}
                              type="button"
                              onClick={() => toggleCriterion(db)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1.5",
                                metCriteria.includes(label)
                                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                              )}
                            >
                              {metCriteria.includes(label) ? (
                                <Plus className="h-3 w-3 rotate-45" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                              {label} (Avoided)
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Textarea
                    id="personalDescription"
                    placeholder="Listing details (Describe what you are offering...)"
                    className={cn(
                      "min-h-[120px] bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base resize-none",
                      form.formState.errors.notes && "border-red-500 focus-visible:ring-red-500"
                    )}
                    {...form.register("notes")}
                  />
                  {form.formState.errors.notes && (
                    <p className="text-xs font-medium text-red-500 px-1">{form.formState.errors.notes.message}</p>
                  )}
                </div>

                {/* Price and Suffix for personal items */}
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="Price (0.00)"
                      className="h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold pl-8"
                      {...form.register("price", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="w-[120px]">
                    <Select
                      value={form.watch("priceSuffix") || ""}
                      onValueChange={(val) => form.setValue("priceSuffix", val)}
                    >
                      <SelectTrigger className="h-14 bg-white border-[#e5e7eb] rounded-xl focus:ring-[#222234] text-sm font-medium">
                        <SelectValue placeholder="Total" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="/hr">/hr</SelectItem>
                        <SelectItem value="/day">/day</SelectItem>
                        <SelectItem value="/night">/night</SelectItem>
                        <SelectItem value="/person">/person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Show these fields only after URL fetch is attempted (for link submissions) */}
            {submissionType === "link" && urlFetchAttempted && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="articleName"
                      className={cn(
                        "h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold pr-10",
                        form.formState.errors.articleName && "border-red-500 focus-visible:ring-red-500"
                      )}
                      placeholder="Article name (e.g., iPhone 15 Pro, Nike Air Max...)"
                      {...form.register("articleName")}
                      disabled={isLoadingPreview}
                    />
                    {form.formState.errors.articleName && (
                      <p className="text-xs font-medium text-red-500 px-1 mt-1">{form.formState.errors.articleName.message}</p>
                    )}
                    {isLoadingPreview && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="w-[120px]">
                    <Select
                      value={form.watch("category") || "TECH"}
                      onValueChange={(val) => form.setValue("category", val)}
                    >
                      <SelectTrigger className="h-14 bg-white border-[#e5e7eb] rounded-xl focus:ring-[#222234] text-xs font-bold">
                        <SelectValue placeholder="Cat." />
                      </SelectTrigger>
                      <SelectContent>
                        {MAIN_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat.toUpperCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="Price (0.00)"
                      className="h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold pl-8"
                      {...form.register("price", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="w-[120px]">
                    <Select
                      value={form.watch("priceSuffix") || ""}
                      onValueChange={(val) => form.setValue("priceSuffix", val)}
                    >
                      <SelectTrigger className="h-14 bg-white border-[#e5e7eb] rounded-xl focus:ring-[#222234] text-sm font-medium">
                        <SelectValue placeholder="Total" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Total</SelectItem>
                        <SelectItem value="/hr">/hr</SelectItem>
                        <SelectItem value="/day">/day</SelectItem>
                        <SelectItem value="/night">/night</SelectItem>
                        <SelectItem value="/person">/person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Criteria Checklist */}
                {(requestPreferences.length > 0 || requestDealbreakers.length > 0) && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[14px] font-bold text-[#1A1A1A]">
                        Match Score
                      </Label>
                      <span className="text-[12px] font-bold text-[#7755FF] bg-[#7755FF]/10 px-2.5 py-1 rounded-full">
                        {metCount}/{totalCriteria} matched
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {requestPreferences.map((pref, idx) => {
                        const label = typeof pref === 'string' ? pref : pref.label;
                        return (
                          <button
                            key={`pref-${idx}`}
                            type="button"
                            onClick={() => toggleCriterion(pref)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1.5",
                              metCriteria.includes(label)
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                            )}
                          >
                            {metCriteria.includes(label) ? (
                              <Plus className="h-3 w-3 rotate-45" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            {label}
                          </button>
                        );
                      })}
                      {requestDealbreakers.map((db, idx) => {
                        const label = typeof db === 'string' ? db : db.label;
                        return (
                          <button
                            key={`db-${idx}`}
                            type="button"
                            onClick={() => toggleCriterion(db)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all flex items-center gap-1.5",
                              metCriteria.includes(label)
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                            )}
                          >
                            {metCriteria.includes(label) ? (
                              <Plus className="h-3 w-3 rotate-45" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            {label} (Avoided)
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Textarea
                  id="notes"
                  placeholder="Offer Details (Tell the buyer why this is perfect...)"
                  className={cn(
                    "min-h-[100px] bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base resize-none",
                    form.formState.errors.notes && "border-red-500 focus-visible:ring-red-500"
                  )}
                  {...form.register("notes")}
                />
                {form.formState.errors.notes && (
                  <p className="text-xs font-medium text-red-500 px-1">{form.formState.errors.notes.message}</p>
                )}
              </div>
            )}

            {/* Save item checkbox for personal items */}
            {submissionType === "personal" && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="saveItem"
                  checked={saveItem}
                  onCheckedChange={(checked) => setSaveItem(checked === true)}
                />
                <label
                  htmlFor="saveItem"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Save listing to my library for future use
                </label>
              </div>
            )}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1 rounded-full !bg-[#212733] !text-white hover:!bg-[#212733]/90"
                disabled={isPending}
              >
                {isPending ? "Submitting..." : submissionType === "link" ? "Submit Proposal" : "Submit Proposal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {zoomImage && (
        <Dialog open={!!zoomImage} onOpenChange={() => setZoomImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
            <div className="relative w-full h-[80vh] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              <Image
                src={zoomImage}
                alt="Zoomed image"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}


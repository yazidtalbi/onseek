"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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

type Values = z.infer<typeof submissionSchema>;

export function SubmissionForm({ requestId, requestBudgetMax, requestDescription, hideButton = false }: { requestId: string; requestBudgetMax?: number | null; requestDescription?: string; hideButton?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
  const form = useForm<Values>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      submissionType: "link",
      url: "",
      articleName: "",
      price: null,
      notes: "",
    },
  });

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
    formData.set("notes", values.notes || "");
    
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
            // Invalidate React Query cache for submissions
            queryClient.invalidateQueries({ queryKey: ["submissions", requestId] });
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
          // Invalidate React Query cache for submissions
          queryClient.invalidateQueries({ queryKey: ["submissions", requestId] });
          // Refresh server components to get updated data
          router.refresh();
        }
      });
    }
  };

  return (
    <>
      {!hideButton && (
        <Button
          type="button"
          id="submission-form-trigger"
          className="h-11 rounded-full bg-[#212733] text-white hover:bg-[#212733]/90"
          onClick={() => handleOpenChange(true)}
        >
          Submit a proposal
        </Button>
      )}
      {hideButton && (
        <Button
          type="button"
          id="submission-form-trigger"
          className="hidden"
          onClick={() => handleOpenChange(true)}
        >
          Submit a proposal
        </Button>
      )}

      <Dialog open={isExpanded} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold">Submit a proposal</DialogTitle>
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
                Personal item
              </button>
          </div>

          {/* URL field - only for link submissions */}
          {submissionType === "link" && (
            <div className="space-y-2">
              <Label htmlFor="url">Product URL</Label>
              <Input 
                id="url" 
                type="url" 
                className="rounded-lg"
                {...form.register("url")} 
              />
              
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
                  <Label>Load from saved items (optional)</Label>
                  <Select onValueChange={handleSelectSavedItem}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select a saved item..." />
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

              {/* Article name - first for personal items */}
              <div className="space-y-2">
                <Label htmlFor="articleName">Article name</Label>
                <Input 
                  id="articleName" 
                  className="rounded-lg"
                  placeholder="e.g., iPhone 15 Pro, Nike Air Max..."
                  {...form.register("articleName")}
                />
              </div>

              {/* Image upload for personal items - second */}
              <div className="space-y-2">
                <Label htmlFor="imageUpload">Item image (optional)</Label>
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload image</span>
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
              <div className="space-y-2">
                <Label htmlFor="personalDescription">Item description</Label>
                <Textarea 
                  id="personalDescription"
                  placeholder="Describe the item you have..."
                  {...form.register("notes")} 
                />
              </div>

              {/* Price - fourth for personal items */}
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="rounded-lg"
                  {...form.register("price", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          {/* Show these fields only after URL fetch is attempted (for link submissions) */}
          {submissionType === "link" && urlFetchAttempted && (
            <>
              <div className="space-y-2">
                <Label htmlFor="articleName">Article name</Label>
                <div className="relative">
                  <Input 
                    id="articleName" 
                    className="rounded-lg pr-10"
                    placeholder="e.g., iPhone 15 Pro, Nike Air Max..."
                    {...form.register("articleName")}
                    disabled={isLoadingPreview}
                  />
                  {isLoadingPreview && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="rounded-lg"
                  {...form.register("price", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Why it matches</Label>
                <Textarea id="notes" {...form.register("notes")} />
              </div>
            </>
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
                Save item for later / future proposals
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
                {isPending ? "Submitting..." : submissionType === "link" ? "Submit link" : "Submit item"}
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


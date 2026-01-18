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
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Loader2, Upload, ZoomIn, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/layout/auth-provider";

type Values = z.infer<typeof submissionSchema>;

export function SubmissionForm({ requestId }: { requestId: string }) {
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

  // Clear preview when switching submission type
  React.useEffect(() => {
    if (submissionType !== "link") {
      setPreviewImage(null);
      setImageError(false);
      setUrlFetchAttempted(false);
      setUrlFetchCompleted(false);
    } else {
      // Reset fetch state when switching back to link
      if (!url) {
        setUrlFetchAttempted(false);
        setUrlFetchCompleted(false);
      }
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

  const onSubmit = (values: Values) => {
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
    // Add uploaded image if available
    if (uploadedImageFile && values.submissionType === "personal") {
      formData.set("image", uploadedImageFile);
    }
    startTransition(async () => {
      const res = await createSubmissionAction(formData);
      setError(res?.error || null);
      if (!res?.error) {
        form.reset();
        setIsExpanded(false);
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
  };

  if (!isExpanded) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          if (!user) {
            // Redirect to login with return URL
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
          } else {
            setIsExpanded(true);
          }
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Submit a link
      </Button>
    );
  }

  return (
    <>
    <Card className="border-border bg-white/80">
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Submission Type Selection */}
          <div className="flex gap-2">
              <Button
                type="button"
                variant={submissionType === "link" ? "default" : "outline"}
                className="flex-1"
                onClick={() => form.setValue("submissionType", "link")}
              >
                Submit a link
              </Button>
              <Button
                type="button"
                variant={submissionType === "personal" ? "default" : "outline"}
                className="flex-1"
                onClick={() => form.setValue("submissionType", "personal")}
              >
                Submit personal item
              </Button>
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

          {/* Description for personal items */}
          {submissionType === "personal" && (
            <div className="space-y-2">
              <Label htmlFor="personalDescription">Item description</Label>
              <Textarea 
                id="personalDescription"
                placeholder="Describe the item you have..."
                {...form.register("notes")} 
              />
              
              {/* Image upload for personal items */}
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
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
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
            </div>
          )}

          {/* Show these fields only after URL fetch is attempted (for link) or always (for personal) */}
          {(submissionType === "personal" || urlFetchAttempted) && (
            <>
              <div className="space-y-2">
                <Label htmlFor="articleName">Article name</Label>
                <div className="relative">
                  <Input 
                    id="articleName" 
                    className="rounded-lg pr-10"
                    placeholder="e.g., iPhone 15 Pro, Nike Air Max..."
                    {...form.register("articleName")}
                    disabled={isLoadingPreview && submissionType === "link"}
                  />
                  {isLoadingPreview && submissionType === "link" && (
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
              {submissionType === "link" && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Why it matches</Label>
                  <Textarea id="notes" {...form.register("notes")} />
                </div>
              )}
            </>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsExpanded(false);
                form.reset();
                setError(null);
                setPreviewImage(null);
                setImageError(false);
                setUploadedImage(null);
                setUploadedImageFile(null);
                setUrlFetchAttempted(false);
                setUrlFetchCompleted(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={isPending}>
              {isPending ? "Submitting..." : submissionType === "link" ? "Submit link" : "Submit item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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


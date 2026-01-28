"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { savePersonalItemAction } from "@/actions/saved-items.actions";
import { useQueryClient } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const personalItemSchema = z.object({
  articleName: z.string().min(1, "Article name is required"),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
});

type PersonalItemValues = z.infer<typeof personalItemSchema>;

export function AddItemModal({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const queryClient = useQueryClient();

  const form = useForm<PersonalItemValues>({
    resolver: zodResolver(personalItemSchema),
    defaultValues: {
      articleName: "",
      description: "",
      price: null,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `personal-items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("submissions").getPublicUrl(filePath);

      setUploadedImage(publicUrl);
      setUploadedImageFile(file);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: PersonalItemValues) => {
    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("articleName", values.articleName);
        if (values.description) {
          formData.set("description", values.description);
        }
        if (values.price) {
          formData.set("price", values.price.toString());
        }
        if (uploadedImage) {
          formData.set("imageUrl", uploadedImage);
        }

        const result = await savePersonalItemAction(formData);

        if ("error" in result) {
          setError(result.error || null);
          return;
        }

        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ["personal-items"] });
        queryClient.invalidateQueries({ queryKey: ["saved-items"] });
        
        // Reset form
        form.reset();
        setUploadedImage(null);
        setUploadedImageFile(null);
        setOpen(false);
        
        onSuccess?.();
      } catch (err: any) {
        setError(err.message || "Failed to save item");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#7755FF] hover:bg-[#6644EE]">
          <Upload className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Personal Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="articleName">Article name *</Label>
            <Input
              id="articleName"
              placeholder="e.g., iPhone 15 Pro, Nike Air Max..."
              {...form.register("articleName")}
            />
            {form.formState.errors.articleName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.articleName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUpload">Item image (optional)</Label>
            <div className="flex items-center gap-2">
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="imageUpload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {isUploading ? "Uploading..." : "Upload image"}
                </span>
              </label>
            </div>
            {uploadedImage && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center group">
                <Image
                  src={uploadedImage}
                  alt="Uploaded item"
                  fill
                  className="object-contain"
                  unoptimized
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
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the item..."
              {...form.register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (optional)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("price", { valueAsNumber: true })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                form.reset();
                setUploadedImage(null);
                setUploadedImageFile(null);
                setError(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="flex-1 bg-[#7755FF] hover:bg-[#6644EE]"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


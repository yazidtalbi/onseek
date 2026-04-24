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
import { cn } from "@/lib/utils";
import { MAIN_CATEGORIES } from "@/lib/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const personalItemSchema = z.object({
  articleName: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
  priceSuffix: z.string().optional(),
  category: z.string().optional(),
  itemType: z.enum(["product", "service"]),
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

  const CATEGORY_GROUPS = {
    Physical: ["Fashion", "Tech", "Gaming", "Home", "Beauty", "Artisanat", "Automotive", "Grocery", "Pets", "Family", "Sports"],
    Services: ["Services", "Learning", "Finance", "Health", "Digital"],
    "Travel/Living": ["Travel", "Property", "Experiences", "Culture"]
  };

  const getUnitForCategory = (cat: string) => {
    if (["Tech", "Fashion", "Gaming", "Home", "Beauty", "Artisanat", "Automotive", "Grocery", "Pets", "Family", "Sports"].includes(cat)) return "Total";
    if (["Services", "Learning"].includes(cat)) return "/hr";
    if (["Travel", "Property"].includes(cat)) return "/night";
    return "Total";
  };

  const form = useForm<PersonalItemValues>({
    resolver: zodResolver(personalItemSchema),
    defaultValues: {
      articleName: "",
      description: "",
      price: null,
      priceSuffix: "Total",
      category: "Tech",
      itemType: "product",
    },
  });

  const itemType = form.watch("itemType");
  const selectedCategory = form.watch("category");

  const getPlaceholders = () => {
    return {
      title: "Name your listing (e.g. iPhone 15, Web Design, Paris Tour...)",
      description: "Provide details about what you are offering...",
      image: "Upload image",
      price: "Price",
    };
  };

  const placeholders = getPlaceholders();

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
        formData.set("itemType", values.itemType);
        if (values.priceSuffix) {
          formData.set("priceSuffix", values.priceSuffix);
        }
        if (values.category) {
          formData.set("category", values.category);
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
          Create Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-[1.5rem] border-none shadow-2xl bg-white">
        <DialogHeader className="px-8 pt-12 pb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight text-[#222234] text-center" style={{ fontFamily: 'var(--font-expanded)' }}>
            What are you listing?
          </DialogTitle>
        </DialogHeader>
        <div className="px-8 pb-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  id="articleName"
                  placeholder={placeholders.title}
                  className="h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold"
                  {...form.register("articleName")}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "h-14 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider whitespace-nowrap",
                      itemType === "product"
                        ? "border-blue-100 bg-blue-50 text-blue-600"
                        : "border-purple-100 bg-purple-50 text-purple-600"
                    )}
                  >
                    {selectedCategory || itemType}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[240px] max-h-[400px] overflow-y-auto rounded-xl shadow-xl border-none p-1 bg-white">
                  {Object.entries(CATEGORY_GROUPS).map(([group, cats]) => (
                    <div key={group} className="p-1">
                      <div className="px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {group}
                      </div>
                      {cats.map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onClick={() => {
                            form.setValue("category", cat);
                            form.setValue("priceSuffix", getUnitForCategory(cat));
                            // Infer type
                            if (CATEGORY_GROUPS.Services.includes(cat) || CATEGORY_GROUPS["Travel/Living"].includes(cat)) {
                              form.setValue("itemType", "service");
                            } else {
                              form.setValue("itemType", "product");
                            }
                          }}
                          className="rounded-lg font-medium cursor-pointer"
                        >
                          {cat}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {form.formState.errors.articleName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.articleName.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
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
                  {isUploading ? "Uploading..." : "Add Media"}
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
            <Textarea
              id="description"
              placeholder={placeholders.description}
              className="min-h-[120px] bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base resize-none"
              {...form.register("description")}
            />
          </div>

          <div className="flex gap-3">
            <div className="relative flex-[2]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder={placeholders.price}
                className="h-14 bg-white border-[#e5e7eb] rounded-xl focus-visible:ring-[#222234] placeholder:text-gray-400 placeholder:font-normal text-base font-semibold pl-8"
                {...form.register("price", { valueAsNumber: true })}
              />
            </div>
            <div className="flex-1">
              <Select 
                onValueChange={(val) => form.setValue("priceSuffix", val)}
                defaultValue={form.getValues("priceSuffix")}
              >
                <SelectTrigger className="h-14 bg-white border-[#e5e7eb] rounded-xl focus:ring-[#222234] font-semibold text-base">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {["Total", "/hr", "/day", "/night", "/project"].map((unit) => (
                    <SelectItem key={unit} value={unit} className="rounded-lg font-medium cursor-pointer">
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                form.reset();
                setUploadedImage(null);
                setUploadedImageFile(null);
                setError(null);
              }}
              className="flex-1 h-12 rounded-full font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="flex-1 h-12 rounded-full font-bold bg-[#222234] hover:bg-[#2a2a4f] text-white shadow-lg shadow-gray-200"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Listing"
              )}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}


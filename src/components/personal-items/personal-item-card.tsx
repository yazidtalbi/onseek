"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Package, ChevronDown } from "lucide-react";
import Image from "next/image";
import { formatTimeAgo } from "@/lib/utils/time";
import { updatePersonalItemAction, deleteSavedPersonalItemAction } from "@/actions/saved-items.actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { PersonalItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MAIN_CATEGORIES } from "@/lib/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import { createRequestUrl } from "@/lib/utils/slug";
import Link from "next/link";
import { AlertCircle, ExternalLink } from "lucide-react";
import { MobileMenu, MobileMenuItem } from "@/components/ui/mobile-menu";


interface PersonalItemCardProps {
  item: PersonalItem & { usageCount?: number };
}

export function PersonalItemCard({ item }: PersonalItemCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showUsageList, setShowUsageList] = useState(false);
  const [formData, setFormData] = useState({
    articleName: item.article_name,
    description: item.description || "",
    price: item.price?.toString() || "",
    priceSuffix: item.price_suffix || "Total",
    category: item.category || "Tech",
    itemType: item.item_type || "product",
    imageUrl: item.image_url || "",
  });

  const { data: proposalHistory } = useQuery({
    queryKey: ["item-usage-history", item.article_name],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from("submissions")
        .select("request_id, requests(id, title, slug, category)")
        .eq("article_name", item.article_name);
      return data || [];
    },
    enabled: showUsageList
  });

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

  const handleUpdate = () => {
    startTransition(async () => {
      const form = new FormData();
      form.append("itemId", item.id);
      form.append("articleName", formData.articleName);
      form.append("description", formData.description);
      form.append("price", formData.price || "");
      form.append("imageUrl", formData.imageUrl);
      form.append("itemType", formData.itemType);
      form.append("priceSuffix", formData.priceSuffix);
      form.append("category", formData.category);

      const result = await updatePersonalItemAction(form);
      if (!("error" in result)) {
        setIsEditDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["personal-items"] });
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const form = new FormData();
      form.append("itemId", item.id);

      const result = await deleteSavedPersonalItemAction(form);
      if (!("error" in result)) {
        setIsDeleteDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["personal-items"] });
        router.refresh();
      }
    });
  };

  return (
    <>
      <Card className=" transition-colors border-none shadow-none bg-transparent">
        <CardContent className="p-0 flex flex-col gap-5">
          <div className="flex items-start gap-5">
            {/* Image */}
            {item.image_url ? (
              <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden border border-[#e5e7eb] bg-gray-100 flex-shrink-0">
                <Image
                  src={item.image_url}
                  alt={item.article_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-[60px] h-[60px] rounded-xl border border-[#e5e7eb] bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6 text-gray-300" />
              </div>
            )}

            {/* Content Header */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-0.5">
                <span className={cn(
                  "text-[10px] font-bold capitalize tracking-normal mb-1",
                  item.item_type === "service" 
                    ? "text-purple-600" 
                    : "text-blue-600"
                )}>
                  {(item.category || item.item_type || "product").toLowerCase()}
                </span>
                <h3 className="text-xl font-semibold text-foreground leading-tight">
                  {item.article_name}
                </h3>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsEditDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu - Drawer */}
            <div className="md:hidden">
              <MobileMenu>
                <MobileMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-5 w-5 mr-3" />
                  Edit listing
                </MobileMenuItem>
                <MobileMenuItem variant="danger" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-5 w-5 mr-3" />
                  Delete listing
                </MobileMenuItem>
              </MobileMenu>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowUsageList(true)}
                  className={cn(
                    "text-[11px] font-bold transition-all px-2.5 py-1 rounded-full",
                    item.usageCount && item.usageCount > 0
                      ? "bg-[#7755FF]/10 text-[#7755FF] hover:bg-[#7755FF]/20"
                      : "bg-gray-100 text-gray-400 opacity-60"
                  )}
                >
                  Proposed for {item.usageCount || 0} requests
                </button>
              </div>
              {item.price && (
                <p className="text-lg text-[#1A1A1A] font-bold">
                  ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {item.price_suffix && <span className="text-sm font-medium text-gray-400 ml-1.5">{item.price_suffix}</span>}
                </p>
              )}
            </div>

            {item.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            )}
            <p className="text-[11px] font-bold text-gray-300 capitalize tracking-normal">
              Saved {formatTimeAgo(item.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
            <DialogDescription>
              Update the details of your listing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 mt-2">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-[13px] text-amber-800 leading-normal font-medium">
              Updating this listing will only affect future proposals. Existing requests you've already applied to will not be updated.
            </p>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="articleName" className="mb-2 block">Name *</Label>
                <Input
                  id="articleName"
                  value={formData.articleName}
                  onChange={(e) =>
                    setFormData({ ...formData, articleName: e.target.value })
                  }
                  placeholder="e.g., Vintage Watch"
                />
              </div>
              <div className="pt-8">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "h-10 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap",
                        formData.itemType === "product"
                          ? "border-blue-100 bg-blue-50 text-blue-600"
                          : "border-purple-100 bg-purple-50 text-purple-600"
                      )}
                    >
                      {formData.category || formData.itemType}
                    <ChevronDown className="h-3 w-3 opacity-50" />
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
                              const newUnit = getUnitForCategory(cat);
                              setFormData({ 
                                ...formData, 
                                category: cat,
                                priceSuffix: newUnit,
                                itemType: (CATEGORY_GROUPS.Services.includes(cat) || CATEGORY_GROUPS["Travel/Living"].includes(cat)) ? "service" : "product"
                              });
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add a description..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-[2]">
                <Label htmlFor="price" className="mb-2 block">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="priceSuffix" className="mb-2 block">Unit</Label>
                <Select 
                  onValueChange={(val) => setFormData({ ...formData, priceSuffix: val })}
                  defaultValue={formData.priceSuffix}
                >
                  <SelectTrigger className="h-10 bg-white border-[#e5e7eb] rounded-lg focus:ring-[#222234] font-medium text-sm">
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
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isPending || !formData.articleName.trim()}
              className="bg-[#7755FF] hover:bg-[#6644EE]"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{item.article_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage History Dialog */}
      <Dialog open={showUsageList} onOpenChange={setShowUsageList}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Usage History</DialogTitle>
            <DialogDescription>
              Requests where "{item.article_name}" was proposed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {proposalHistory && (proposalHistory as any).length > 0 ? (
              (proposalHistory as any).map((usage: any, idx: number) => (
                <Link
                  key={idx}
                  href={createRequestUrl(usage.requests)}
                  target="_blank"
                  className="block p-4 rounded-2xl border border-gray-100 hover:border-[#7755FF]/20 hover:bg-[#7755FF]/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 capitalize tracking-[0.1em] leading-none mb-1">
                        {usage.requests?.category || "General"}
                      </span>
                      <h4 className="font-semibold text-gray-900 group-hover:text-[#7755FF] transition-colors line-clamp-2">
                        {usage.requests?.title}
                      </h4>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-[#7755FF] transition-colors mt-1 shrink-0" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium italic">No history found for this item.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


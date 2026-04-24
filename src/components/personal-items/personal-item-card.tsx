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

interface PersonalItemCardProps {
  item: PersonalItem;
}

export function PersonalItemCard({ item }: PersonalItemCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    articleName: item.article_name,
    description: item.description || "",
    price: item.price?.toString() || "",
    priceSuffix: item.price_suffix || "Total",
    category: item.category || "Tech",
    itemType: item.item_type || "product",
    imageUrl: item.image_url || "",
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
      <Card className=" transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Image */}
            {item.image_url ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-100 flex-shrink-0">
                <Image
                  src={item.image_url}
                  alt={item.article_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border border-[#e5e7eb] bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.article_name}
                    </h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.item_type === "service" 
                        ? "bg-purple-50 text-purple-600 border border-purple-100" 
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                    )}>
                      {item.category || item.item_type || "product"}
                    </span>
                  </div>
                  {item.price && (
                    <p className="text-base text-[#7755FF] font-semibold mb-2">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {item.price_suffix && <span className="text-sm font-normal text-gray-500 ml-1">{item.price_suffix}</span>}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Saved {formatTimeAgo(item.created_at)}
                  </p>
                </div>

                {/* Menu */}
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
            </div>
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
    </>
  );
}


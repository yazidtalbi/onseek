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
import { MoreHorizontal, Edit, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { formatTimeAgo } from "@/lib/utils/time";
import { updatePersonalItemAction, deleteSavedPersonalItemAction } from "@/actions/saved-items.actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { PersonalItem } from "@/lib/types";

interface PersonalItemCardProps {
  item: PersonalItem;
}

export function PersonalItemCard({ item }: PersonalItemCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    articleName: item.article_name,
    description: item.description || "",
    price: item.price?.toString() || "",
    imageUrl: item.image_url || "",
  });

  const handleUpdate = () => {
    startTransition(async () => {
      const form = new FormData();
      form.append("itemId", item.id);
      form.append("articleName", formData.articleName);
      form.append("description", formData.description);
      form.append("price", formData.price || "");
      form.append("imageUrl", formData.imageUrl);

      const result = await updatePersonalItemAction(form);
      if (!("error" in result)) {
        setIsEditDialogOpen(false);
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
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {item.article_name}
                  </h3>
                  {item.price && (
                    <p className="text-base text-[#7755FF] font-semibold mb-2">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <DialogTitle>Edit Personal Item</DialogTitle>
            <DialogDescription>
              Update the details of your personal item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="articleName">Article Name *</Label>
              <Input
                id="articleName"
                value={formData.articleName}
                onChange={(e) =>
                  setFormData({ ...formData, articleName: e.target.value })
                }
                placeholder="e.g., Vintage Watch"
              />
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
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
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
            <DialogTitle>Delete Personal Item?</DialogTitle>
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


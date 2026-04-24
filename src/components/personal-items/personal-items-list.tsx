"use client";

import { PersonalItemCard } from "./personal-item-card";
import { Package } from "lucide-react";
import type { PersonalItem } from "@/lib/types";

interface PersonalItemsListProps {
  initialItems: PersonalItem[];
}

export function PersonalItemsList({ initialItems }: PersonalItemsListProps) {
  if (initialItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#e5e7eb]  p-12 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Save listings when submitting to requests. They'll appear here for easy reuse in your library.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {initialItems.length} listing{initialItems.length !== 1 ? "s" : ""} saved
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {initialItems.map((item) => (
          <PersonalItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}


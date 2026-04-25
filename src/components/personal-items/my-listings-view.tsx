"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PersonalItemCard } from "./personal-item-card";
import { AddItemModal } from "./add-item-modal";
import type { PersonalItem } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MyListingsViewProps {
  initialItems: PersonalItem[];
}

export function MyListingsView({ initialItems }: MyListingsViewProps) {
  const [status, setStatus] = useState<"all" | "product" | "service">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");

  const { data: usageData } = useQuery({
    queryKey: ["my-submissions-usage"],
    queryFn: async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from("submissions").select("article_name").eq("user_id", user.id);
      return data || [];
    }
  });

  const getUsageCount = (articleName: string) => {
    if (!usageData) return 0;
    return usageData.filter(s => s.article_name === articleName).length;
  };

  const categories = ["All Categories", ...Array.from(new Set(initialItems.map(i => i.category || "Uncategorized"))).sort()];

  const filteredItems = initialItems.filter(item => {
    const matchesStatus = status === "all" || ((item as any).item_type?.toLowerCase() || "product") === status;
    const matchesCategory = selectedCategory === "All Categories" || (item.category || "Uncategorized") === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  const totalCount = initialItems.length;
  const productCount = initialItems.filter(i => ((i as any).item_type?.toLowerCase() || "product") === "product").length;
  const serviceCount = initialItems.filter(i => (i as any).item_type?.toLowerCase() === "service").length;

  return (
    <div className="flex-1 w-full max-w-[420px]">
      {/* Tabs & Filters Navigation */}
      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-1 w-fit">
          <button
            onClick={() => setStatus("all")}
            className={cn(
              "px-6 py-2 text-[14px] font-bold transition-all rounded-full whitespace-nowrap",
              status === "all" ? "bg-[#7755FF]/10 text-[#7755FF]" : "text-gray-400 hover:text-gray-900"
            )}
          >
            All <span className={cn("ml-0.5 font-medium", status === "all" ? "text-[#7755FF]/60" : "opacity-40")}>{totalCount}</span>
          </button>
          <button
            onClick={() => setStatus("product")}
            className={cn(
              "px-6 py-2 text-[14px] font-bold transition-all rounded-full whitespace-nowrap",
              status === "product" ? "bg-[#7755FF]/10 text-[#7755FF]" : "text-gray-400 hover:text-gray-900"
            )}
          >
            Products <span className={cn("ml-0.5 font-medium", status === "product" ? "text-[#7755FF]/60" : "opacity-40")}>{productCount}</span>
          </button>
          <button
            onClick={() => setStatus("service")}
            className={cn(
              "px-6 py-2 text-[14px] font-bold transition-all rounded-full whitespace-nowrap",
              status === "service" ? "bg-[#7755FF]/10 text-[#7755FF]" : "text-gray-400 hover:text-gray-900"
            )}
          >
            Services <span className={cn("ml-0.5 font-medium", status === "service" ? "text-[#7755FF]/60" : "opacity-40")}>{serviceCount}</span>
          </button>
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex items-center justify-end gap-3 w-full">
          <span className="text-[11px] font-bold text-gray-400 capitalize tracking-normal">Filter by</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px] h-9 rounded-full bg-white border-gray-200 text-[13px] font-bold text-gray-700 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-xl">
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="rounded-xl text-[13px] font-medium cursor-pointer">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="p-6 rounded-[24px] border border-gray-100 bg-white">
              <PersonalItemCard 
                item={{
                  ...item,
                  usageCount: getUsageCount(item.article_name)
                } as any} 
              />
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-sm text-gray-400 font-medium">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
}


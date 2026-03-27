"use client";

import * as React from "react";
import { Check, ChevronDown, X, Package, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MAIN_CATEGORIES, SUBCATEGORIES } from "@/lib/categories";

// Common item types for quick selection
const QUICK_ITEMS = [
  "Watch", "Car", "Laptop", "Smartphone", "Headphones", "Camera", "Drone", "Monitor", "Tablet", 
  "Console", "TV", "Speakers", "Furniture", "Sneakers", "Handbag", "Fragrance", "Makeup", 
  "Baby Gear", "Toys", "Bike", "Coffee Machine", "Air Fryer", "Vacuum", "Tools"
];

// Flatten all subcategories from the catalog
const CATALOG_SUBCATEGORIES = Array.from(new Set(Object.values(SUBCATEGORIES).flat()));

// Final list of suggestions
const ALL_SUGGESTIONS = Array.from(new Set([...QUICK_ITEMS, ...CATALOG_SUBCATEGORIES])).sort();

export function CategoryCombobox({
  value,
  onChange,
  placeholder = "Select an item type...",
  className,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter based on search query
  const filteredItems = React.useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    if (!searchQuery) return ALL_SUGGESTIONS;
    
    return ALL_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  // Handle selection
  const handleSelect = (item: string) => {
    onChange(item);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const hasResults = filteredItems.length > 0;

  return (
    <>
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <div
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 w-full h-11 rounded-lg border border-[#e5e7eb] px-4 pr-20 cursor-pointer hover:border-gray-300 transition-colors bg-white shadow-sm"
          >
            <Package className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className={cn(
              "flex-1 text-sm truncate",
              !value && "text-gray-500"
            )}>
              {value || placeholder}
            </span>
          </div>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-50"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[70vh] flex flex-col p-4 sm:p-6 sm:rounded-2xl">
          <div className="flex flex-col h-full min-h-0">
            <h3 className="text-lg font-semibold mb-1">What are you looking for?</h3>
            <p className="text-sm text-gray-500 mb-4">Select the type of item you want to find</p>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items (e.g. Watch, Car)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11"
                autoFocus
              />
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto pr-1">
              {hasResults ? (
                <div className="grid grid-cols-1 gap-1">
                  {filteredItems.map((item) => {
                    const isSelected = value === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left",
                          "hover:bg-gray-100 cursor-pointer",
                          isSelected ? "bg-[#7755FF]/5 text-[#7755FF] font-medium" : "text-gray-700"
                        )}
                      >
                        <span>{item}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No matches found</p>
                  <button 
                    type="button"
                    onClick={() => handleSelect(searchQuery)}
                    className="mt-2 text-sm text-[#7755FF] font-semibold hover:underline"
                  >
                    Add "{searchQuery}" as category
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

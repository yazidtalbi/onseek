"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Filter, LayoutList, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { Slider } from "@/components/ui/slider";
import { MAIN_CATEGORIES } from "@/lib/categories";

const categories = ["All", ...MAIN_CATEGORIES];

export function RequestFilters({ 
  viewMode, 
  onViewModeChange,
  hideViewToggle = false
}: { 
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  hideViewToggle?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "newest";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const country = searchParams.get("country") || "";
  const [showFilters, setShowFilters] = useState(false);
  
  // Convert price strings to numbers for slider, default to [0, 10000]
  const minPrice = priceMin ? parseInt(priceMin, 10) : 0;
  const maxPrice = priceMax ? parseInt(priceMax, 10) : 10000;
  const [priceRange, setPriceRange] = useState<number[]>([minPrice, maxPrice]);
  
  // Sync price range with URL params when they change
  React.useEffect(() => {
    const newMin = priceMin ? parseInt(priceMin, 10) : 0;
    const newMax = priceMax ? parseInt(priceMax, 10) : 10000;
    setPriceRange([newMin, newMax]);
  }, [priceMin, priceMax]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "" || value === "0") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to page 1 when category changes
    if (key === "category") {
      params.delete("page");
    }
    // Navigate to search page if there's a search query, otherwise app home
    const hasQuery = searchParams.get("q");
    const path = hasQuery ? "/search" : "/app";
    router.push(`${path}?${params.toString()}`);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    const params = new URLSearchParams(searchParams.toString());
    if (values[0] > 0) {
      params.set("priceMin", values[0].toString());
    } else {
      params.delete("priceMin");
    }
    if (values[1] < 10000) {
      params.set("priceMax", values[1].toString());
    } else {
      params.delete("priceMax");
    }
    const hasQuery = searchParams.get("q");
    const path = hasQuery ? "/search" : "/app";
    router.push(`${path}?${params.toString()}`);
  };

  const hasActiveFilters = priceMin || priceMax || country;

  return (
    <div className="space-y-4">
      {/* Top Row: Sort and Filters */}
      <div className="flex items-center justify-between gap-4 w-full overflow-x-auto pb-2">
        <div className="flex items-center gap-4 shrink-0">
          {/* Empty left side - can be used for future filters */}
        </div>

        {/* Right side: Newest, View Selector and Price Filter */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Newest Dropdown */}
          <Select
            value={sort}
            onValueChange={(value) => updateParam("sort", value)}
          >
            <SelectTrigger className="!w-auto !h-auto !border-0 !bg-transparent !rounded-none text-sm font-medium shrink-0 hover:!bg-transparent focus:!ring-0 focus:!ring-offset-0">
              <SelectValue>
                {sort === "newest" ? "Newest" : sort === "active" ? "Most active" : "Popular"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="active">Most active</SelectItem>
            </SelectContent>
          </Select>

          {/* View Selector */}
          {!hideViewToggle && viewMode !== undefined && onViewModeChange && (
            <div className="flex gap-1 rounded-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  viewMode === "list" && "bg-gray-100"
                )}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  viewMode === "grid" && "bg-gray-100"
                )}
                title="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Price Filter Icon - Far Right */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-full",
              hasActiveFilters && (priceMin || priceMax) && "bg-gray-100"
            )}
            onClick={() => setShowFilters(!showFilters)}
            title="Price filter"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Inputs Row - Expandable */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Price Range */}
        <div className="space-y-3">
          <Label htmlFor="priceRange" className="text-sm font-medium text-muted-foreground">Price</Label>
          <div className="space-y-2">
            <Slider
              id="priceRange"
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>
        
        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium text-muted-foreground">Country</Label>
          <CountryCombobox
            value={country || null}
            onChange={(value) => updateParam("country", value)}
            placeholder="Select or type country"
            className="h-9"
          />
        </div>
        </div>
      )}
    </div>
  );
}


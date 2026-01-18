"use client";

import { useState } from "react";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountryCombobox } from "@/components/ui/country-combobox";
import { Slider } from "@/components/ui/slider";
import { MAIN_CATEGORIES } from "@/lib/categories";

const categories = ["All", ...MAIN_CATEGORIES];

export function RequestFilters() {
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
    // Navigate to search page if there's a search query, otherwise home
    const hasQuery = searchParams.get("q");
    const path = hasQuery ? "/search" : "/";
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
    const path = hasQuery ? "/search" : "/";
    router.push(`${path}?${params.toString()}`);
  };

  const hasActiveFilters = priceMin || priceMax || country;

  return (
    <div className="space-y-4">
      {/* Top Row: Sort and Filters */}
      <div className="flex items-center gap-4 w-full overflow-x-auto pb-2">
        {/* Popular Dropdown */}
        <Select
          value={sort}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger className="w-[120px] h-9 rounded-full border border-[#e5e7eb] bg-white text-sm font-medium shrink-0">
            <SelectValue>
              {sort === "newest" ? "Newest" : sort === "active" ? "Most active" : "Popular"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="active">Most active</SelectItem>
          </SelectContent>
        </Select>

        {/* Filters Button - Right Side */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full border border-[#e5e7eb] bg-white h-9 text-sm font-medium shrink-0",
            hasActiveFilters && "border-foreground"
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
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


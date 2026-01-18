"use client";

import { useState } from "react";
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

const categories = [
  "All",
  "Tech",
  "Home",
  "Fashion",
  "Auto",
  "Collectibles",
  "Local",
];

export function RequestFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "newest";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const country = searchParams.get("country") || "";
  const [showFilters, setShowFilters] = useState(false);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "") {
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

  const hasActiveFilters = priceMin || priceMax || country;

  return (
    <div className="space-y-4">
      {/* Top Row: Sort and Categories */}
      <div className="flex items-center gap-4 w-full overflow-x-auto pb-2">
        {/* Popular Dropdown */}
        <Select
          value={sort}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger className="w-[120px] h-9 rounded-lg border border-border bg-white text-sm font-medium shrink-0">
            <SelectValue>
              {sort === "newest" ? "Newest" : sort === "active" ? "Most active" : "Popular"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="active">Most active</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Links - Centered */}
        <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto py-1">
          {categories.map((category) => {
            const isActive = currentCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => updateParam("category", category)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-lg border border-border",
                  isActive
                    ? "bg-muted/30 text-foreground border-foreground"
                    : "bg-white text-foreground hover:bg-muted/10"
                )}
              >
                {category === "All" ? "Discover" : category}
              </button>
            );
          })}
        </div>

        {/* Filters Button - Right Side */}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-lg border border-border bg-white h-9 text-sm font-medium shrink-0",
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
        <div className="space-y-2">
          <Label htmlFor="priceMin" className="text-sm font-medium text-muted-foreground">Price</Label>
          <div className="flex items-center gap-2">
            <Input
              id="priceMin"
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => updateParam("priceMin", e.target.value)}
              className="h-9 text-sm rounded-lg"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              id="priceMax"
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => updateParam("priceMax", e.target.value)}
              className="h-9 text-sm rounded-lg"
            />
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


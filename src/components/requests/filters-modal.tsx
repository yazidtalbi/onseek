"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// @ts-ignore - react-select-country-list doesn't have type definitions
import countryListFactory from "react-select-country-list";

// Initialize country list
const countryList = countryListFactory();
const countryLabels: string[] = countryList.getLabels();

interface FiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function FiltersModal({ open, onOpenChange, children }: FiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";
  const priceMax = searchParams.get("priceMax") || "";
  const country = searchParams.get("country") || "";

  // Local state for form
  const [localSort, setLocalSort] = React.useState(sort);
  const [localPriceMax, setLocalPriceMax] = React.useState(priceMax);
  const [localCountry, setLocalCountry] = React.useState(country || "all");
  const [priceSlider, setPriceSlider] = React.useState<number[]>([
    priceMax ? parseInt(priceMax, 10) : 10000,
  ]);

  // Sync local state when modal opens
  React.useEffect(() => {
    if (open) {
      setLocalSort(sort);
      setLocalPriceMax(priceMax);
      setLocalCountry(country || "all");
      setPriceSlider([priceMax ? parseInt(priceMax, 10) : 10000]);
    }
  }, [open, sort, priceMax, country]);

  // Sync slider with input
  React.useEffect(() => {
    if (localPriceMax) {
      const numValue = parseInt(localPriceMax, 10);
      if (!isNaN(numValue)) {
        setPriceSlider([Math.min(numValue, 10000)]);
      }
    } else {
      setPriceSlider([10000]);
    }
  }, [localPriceMax]);

  // Sync input with slider
  const handleSliderChange = (value: number[]) => {
    setPriceSlider(value);
    setLocalPriceMax(value[0] === 10000 ? "" : value[0].toString());
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "0" || value === "newest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/app?${params.toString()}`);
  };

  const handleSave = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update sort
    if (localSort && localSort !== "newest") {
      params.set("sort", localSort);
    } else {
      params.delete("sort");
    }

    // Update max price
    if (localPriceMax && localPriceMax !== "") {
      params.set("priceMax", localPriceMax);
    } else {
      params.delete("priceMax");
    }

    // Update country
    if (localCountry && localCountry !== "all") {
      params.set("country", localCountry);
    } else {
      params.delete("country");
    }

    params.delete("page");
    router.push(`/app?${params.toString()}`);
    onOpenChange(false);
  };

  const handleClearAll = () => {
    setLocalSort("newest");
    setLocalPriceMax("");
    setLocalCountry("all");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("sort");
    params.delete("priceMax");
    params.delete("country");
    params.delete("page");
    router.push(`/app?${params.toString()}`);
    onOpenChange(false);
  };

  const hasActiveFilters = priceMax || country || (sort && sort !== "newest");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4">
          <DialogTitle className="text-lg font-semibold">Filters</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sort by */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sort by</Label>
            <Select value={localSort} onValueChange={setLocalSort}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sort option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="active">Most active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Max price</Label>
            <div className="space-y-2">
              <Slider
                min={0}
                max={10000}
                step={100}
                value={priceSlider}
                onValueChange={handleSliderChange}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>$0</span>
                <span>{priceSlider[0] === 10000 ? "$500+" : `$${priceSlider[0]}`}</span>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                value={localPriceMax}
                onChange={(e) => setLocalPriceMax(e.target.value)}
                placeholder="500"
                className="w-full pl-8"
                min="0"
                max="10000"
              />
            </div>
          </div>

          {/* Location/Country */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location</Label>
            <Select value={localCountry || "all"} onValueChange={(value) => setLocalCountry(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Countries</SelectItem>
                {countryLabels.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear all filters
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#212733] text-white hover:bg-[#212733]/90"
          >
            Save filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [open, setOpen] = useState(false);

  // Parse Initial URLs
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const initialCountry = searchParams.get("country") || "";
  const initialCondition = searchParams.get("condition") || "";
  const initialPrefs = searchParams.getAll("pref");
  const initialDealbreakers = searchParams.getAll("dealbreaker");

  const minPrice = priceMin ? parseInt(priceMin, 10) : 0;
  const maxPrice = priceMax ? parseInt(priceMax, 10) : 10000;

  // Local State
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([minPrice, maxPrice]);
  const [localCountry, setLocalCountry] = useState(initialCountry);
  const [localCondition, setLocalCondition] = useState(initialCondition);
  const [localPrefs, setLocalPrefs] = useState<string[]>(initialPrefs);
  const [localDealbreakers, setLocalDealbreakers] = useState<string[]>(initialDealbreakers);

  const [prefInput, setPrefInput] = useState("");
  const [dealInput, setDealInput] = useState("");

  // Sync state when open changes
  useEffect(() => {
    if (open) {
      setLocalPriceRange([
        priceMin ? parseInt(priceMin, 10) : 0,
        priceMax ? parseInt(priceMax, 10) : 10000
      ]);
      setLocalCountry(searchParams.get("country") || "");
      setLocalCondition(searchParams.get("condition") || "");
      setLocalPrefs(searchParams.getAll("pref"));
      setLocalDealbreakers(searchParams.getAll("dealbreaker"));
      setPrefInput("");
      setDealInput("");
    }
  }, [open, searchParams, priceMin, priceMax]);

  const handleAddLocalTag = (type: "pref" | "dealbreaker", val: string) => {
    if (!val.trim()) return;
    if (type === "pref") {
      setLocalPrefs(prev => Array.from(new Set([...prev, val.trim()])));
      setPrefInput("");
    } else {
      setLocalDealbreakers(prev => Array.from(new Set([...prev, val.trim()])));
      setDealInput("");
    }
  };

  const handleRemoveLocalTag = (type: "pref" | "dealbreaker", val: string) => {
    if (type === "pref") {
      setLocalPrefs(prev => prev.filter(t => t !== val));
    } else {
      setLocalDealbreakers(prev => prev.filter(t => t !== val));
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (localPriceRange[0] > 0) params.set("priceMin", localPriceRange[0].toString());
    else params.delete("priceMin");
    
    if (localPriceRange[1] < 10000) params.set("priceMax", localPriceRange[1].toString());
    else params.delete("priceMax");

    if (localCountry) params.set("country", localCountry);
    else params.delete("country");

    if (localCondition && localCondition !== "All") params.set("condition", localCondition);
    else params.delete("condition");

    params.delete("pref");
    localPrefs.forEach(p => params.append("pref", p));

    params.delete("dealbreaker");
    localDealbreakers.forEach(d => params.append("dealbreaker", d));

    params.delete("page");
    router.push(`/search?${params.toString()}`);
    setOpen(false);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (searchParams.get("q")) params.set("q", searchParams.get("q") as string);
    if (searchParams.get("view")) params.set("view", searchParams.get("view") as string);
    router.push(`/search?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Trigger */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 rounded-full h-10 px-4 border-[#e5e7eb] font-medium shadow-none bg-white">
            <Filter className="h-4 w-4" />
            Filters
            {(priceMin || priceMax || initialCountry || initialPrefs.length > 0 || initialDealbreakers.length > 0 || initialCondition) ? (
              <span className="w-2 h-2 rounded-full bg-[#7755FF] ml-1" />
            ) : null}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Search Filters</DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-8">
            {/* Budget */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Max Budget</Label>
              <div className="pt-4 px-2">
                <Slider
                  value={[localPriceRange[1]]}
                  min={0}
                  max={10000}
                  step={50}
                  onValueChange={(val) => setLocalPriceRange([0, val[0]])}
                  className="w-full"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">$0</span>
                  <span className="text-sm font-medium">${localPriceRange[1]}{localPriceRange[1] === 10000 ? "+" : ""}</span>
                </div>
              </div>
            </div>

            {/* Country Filter */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Country</Label>
              <CountryCombobox
                value={localCountry}
                onChange={setLocalCountry}
              />
            </div>

            {/* Condition Filter */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Condition</Label>
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex-1 px-4 rounded-xl border h-12 transition-all font-medium text-sm",
                    (localCondition === "New" || localCondition === "Either")
                      ? "bg-white text-black !border-[#222234] border-2 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200"
                  )}
                  onClick={() => {
                    if (localCondition === "New" || localCondition === "Either") {
                      setLocalCondition(localCondition === "Either" ? "Used" : "");
                    } else {
                      setLocalCondition(localCondition === "Used" ? "Either" : "New");
                    }
                  }}
                >
                  New
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex-1 px-4 rounded-xl border h-12 transition-all font-medium text-sm",
                    (localCondition === "Used" || localCondition === "Either")
                      ? "bg-white text-black !border-[#222234] border-2 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200"
                  )}
                  onClick={() => {
                    if (localCondition === "Used" || localCondition === "Either") {
                      setLocalCondition(localCondition === "Either" ? "New" : "");
                    } else {
                      setLocalCondition(localCondition === "New" ? "Either" : "Used");
                    }
                  }}
                >
                  Used
                </Button>
              </div>
            </div>

            {/* Preferences Tags (Green) */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Must Include (Preferences)</Label>
              <p className="text-xs text-muted-foreground leading-snug">Requests must match these keywords.</p>
              <div className="flex items-center gap-2">
                <Input
                  value={prefInput}
                  onChange={(e) => setPrefInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLocalTag("pref", prefInput))}
                  placeholder="e.g. New condition"
                  className="h-10 text-sm placeholder:text-gray-400"
                />
                <Button type="button" onClick={() => handleAddLocalTag("pref", prefInput)} className="shrink-0 bg-[#7755FF] hover:bg-[#6644EE] text-white">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {localPrefs.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {p}
                    <button onClick={() => handleRemoveLocalTag("pref", p)} className="hover:text-green-900 flex items-center">&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dealbreakers Tags (Orange) */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Must Exclude (Dealbreakers)</Label>
              <p className="text-xs text-muted-foreground leading-snug">Exclude requests containing these keywords.</p>
              <div className="flex items-center gap-2">
                <Input
                  value={dealInput}
                  onChange={(e) => setDealInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLocalTag("dealbreaker", dealInput))}
                  placeholder="e.g. Used, Scratches"
                  className="h-10 text-sm placeholder:text-gray-400"
                />
                <Button type="button" onClick={() => handleAddLocalTag("dealbreaker", dealInput)} className="shrink-0 bg-[#7755FF] hover:bg-[#6644EE] text-white">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {localDealbreakers.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {d}
                    <button onClick={() => handleRemoveLocalTag("dealbreaker", d)} className="hover:text-orange-900 flex items-center">&times;</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={clearAllFilters} className="sm:mr-auto rounded-full text-gray-700 font-medium">
              Clear All
            </Button>
            <Button onClick={applyFilters} className="rounded-full bg-[#7755FF] hover:bg-[#6644EE] text-white px-8 font-medium shadow-sm">
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Selector Desktop */}
      {!hideViewToggle && viewMode !== undefined && onViewModeChange && (
        <div className="flex items-center gap-1 rounded-full border border-[#e5e7eb] p-1 bg-white ml-auto">
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
    </div>
  );
}

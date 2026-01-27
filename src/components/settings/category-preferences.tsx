"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Search, Sparkles } from "lucide-react";
import { savePreferencesAction, getCategoriesAction, getUserPreferencesAction } from "@/actions/preference.actions";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryPreferences() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [catsResult, prefsResult] = await Promise.all([
          getCategoriesAction(),
          getUserPreferencesAction(),
        ]);

        if ("error" in catsResult) {
          console.error("Failed to load categories:", catsResult.error);
          return;
        }

        setCategories(catsResult);

        if (!("error" in prefsResult)) {
          const selected = new Set(prefsResult.preferences.map((p) => p.category_id));
          setSelectedCategories(selected);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const result = await savePreferencesAction(Array.from(selectedCategories));
      if ("error" in result) {
        setSaveStatus("error");
      } else {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  // Group categories by parent
  const mainCategories = categories.filter((c) => !c.parent_id);
  const subcategoriesByParent = categories.reduce(
    (acc, cat) => {
      if (cat.parent_id) {
        if (!acc[cat.parent_id]) {
          acc[cat.parent_id] = [];
        }
        acc[cat.parent_id].push(cat);
      }
      return acc;
    },
    {} as Record<string, Category[]>
  );

  // Filter categories based on search
  const filteredMainCategories = mainCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubcategories = Object.entries(subcategoriesByParent).reduce(
    (acc, [parentId, subs]) => {
      const filtered = subs.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[parentId] = filtered;
      }
      return acc;
    },
    {} as Record<string, Category[]>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const hasChanges = selectedCategories.size > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#7755FF]" />
          <h3 className="text-lg font-semibold">Interests</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select categories you're interested in to personalize your feed. We'll show you more requests that match your interests.
        </p>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto">
          {filteredMainCategories.length === 0 && searchQuery ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No categories found matching "{searchQuery}"
            </p>
          ) : (
            filteredMainCategories.map((mainCat) => {
              const subcats = filteredSubcategories[mainCat.id] || [];
              const allCats = [mainCat, ...subcats];
              const selectedCount = allCats.filter((c) => selectedCategories.has(c.id)).length;

              return (
                <div key={mainCat.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{mainCat.name}</h4>
                    {selectedCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedCount} selected
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allCats.map((cat) => {
                      const isSelected = selectedCategories.has(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                            isSelected
                              ? "bg-[#7755FF] text-white hover:bg-[#6644EE]"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                          )}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedCategories.size > 0
              ? `${selectedCategories.size} categor${selectedCategories.size === 1 ? "y" : "ies"} selected`
              : "No categories selected"}
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === "success" && (
              <span className="text-sm text-green-600">Saved!</span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-red-600">Failed to save</span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-[#7755FF] hover:bg-[#6644EE]"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


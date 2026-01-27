"use client";

import type { FeedMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FeedModeTabsProps {
  mode: FeedMode;
  onModeChange: (mode: FeedMode) => void;
  selectedInterests?: string[];
  hasPreferences?: boolean;
}

export function FeedModeTabs({
  mode,
  onModeChange,
  selectedInterests = [],
  hasPreferences = false,
}: FeedModeTabsProps) {
  const tabs = [
    { value: "for_you" as FeedMode, label: "For you", disabled: !hasPreferences },
    { value: "latest" as FeedMode, label: "Latest" },
    { value: "trending" as FeedMode, label: "Trending" },
  ];

  return (
    <div className="flex items-center gap-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = mode === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => !tab.disabled && onModeChange(tab.value)}
            disabled={tab.disabled}
            className={cn(
              "text-sm font-medium whitespace-nowrap transition-colors relative",
              tab.disabled && "opacity-50 cursor-not-allowed text-gray-400",
              !tab.disabled && !isActive && "text-gray-500 hover:text-gray-700",
              isActive && "text-black border-b-2 border-black pb-1"
            )}
          >
            {tab.label}
          </button>
        );
      })}

      {/* Show selected interests */}
      {hasPreferences && selectedInterests.length > 0 && mode === "for_you" && (
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground ml-auto">
          <span>Following:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {selectedInterests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
              >
                {interest}
              </span>
            ))}
            {selectedInterests.length > 3 && (
              <span className="text-muted-foreground">
                +{selectedInterests.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


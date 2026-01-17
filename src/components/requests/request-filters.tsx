"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const status = searchParams.get("status") || "open";
  const sort = searchParams.get("sort") || "newest";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/app?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => updateParam("category", category)}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-xs font-semibold",
              currentCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-white/70 text-muted-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {[
          { label: "Unsolved", value: "open" },
          { label: "Solved", value: "solved" },
          { label: "Closed", value: "closed" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => updateParam("status", item.value)}
            className={cn(
              "rounded-full border border-border px-4 py-2",
              status === item.value
                ? "bg-accent text-accent-foreground"
                : "bg-white/70 text-muted-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
        {[
          { label: "Newest", value: "newest" },
          { label: "Most active", value: "active" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => updateParam("sort", item.value)}
            className={cn(
              "rounded-full border border-border px-4 py-2",
              sort === item.value
                ? "bg-primary text-primary-foreground"
                : "bg-white/70 text-muted-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}


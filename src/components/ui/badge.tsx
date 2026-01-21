import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "muted";
}

function badgeStyles(variant: BadgeProps["variant"]) {
  return cn(
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
    variant === "default" && "bg-[#f0f3f8] text-[#424143]",
    variant === "outline" &&
      "border border-[#e5e7eb] bg-[#f0f3f8] text-[#424143]",
    variant === "muted" && "bg-[#f0f3f8] text-[#424143]"
  );
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div ref={ref} className={cn(badgeStyles(variant), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { Badge };


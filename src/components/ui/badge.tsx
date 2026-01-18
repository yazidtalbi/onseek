import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "muted";
}

function badgeStyles(variant: BadgeProps["variant"]) {
  return cn(
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
    variant === "default" && "bg-[#F5F6F9] text-foreground",
    variant === "outline" &&
      "border border-[#e5e7eb] bg-[#F5F6F9] text-foreground",
    variant === "muted" && "bg-[#F5F6F9] text-foreground"
  );
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div ref={ref} className={cn(badgeStyles(variant), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { Badge };


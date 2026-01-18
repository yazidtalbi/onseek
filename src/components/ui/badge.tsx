import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "muted";
}

function badgeStyles(variant: BadgeProps["variant"]) {
  return cn(
    "inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium",
    variant === "default" && "bg-muted/50 text-foreground",
    variant === "outline" &&
      "border border-border bg-muted/50 text-foreground",
    variant === "muted" && "bg-muted/50 text-foreground"
  );
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div ref={ref} className={cn(badgeStyles(variant), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { Badge };


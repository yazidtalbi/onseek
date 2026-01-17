import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "muted";
}

function badgeStyles(variant: BadgeProps["variant"]) {
  return cn(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
    variant === "default" && "bg-primary text-primary-foreground",
    variant === "outline" &&
      "border border-border bg-transparent text-foreground",
    variant === "muted" && "bg-muted/40 text-muted-foreground"
  );
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div ref={ref} className={cn(badgeStyles(variant), className)} {...props} />
  )
);
Badge.displayName = "Badge";

export { Badge };


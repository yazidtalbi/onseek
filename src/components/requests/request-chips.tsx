"use client";

import { Check, X, MapPin, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Info chip with icon and label (e.g., Budget, Location)
 */
export function InfoChip({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}) {
  return (
    <Badge
      variant="muted"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 bg-[#BD9BBB]/10 text-[#824F8D] border-none",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Badge>
  );
}

/**
 * Status chip for condition (New/Used)
 */
export function StatusChip({
  condition,
  className,
}: {
  condition: string | null | undefined;
  className?: string;
}) {
  if (!condition || condition === "any" || condition === "Either") return null;

  const isNew = condition.toLowerCase() === "new";

  return (
    <Badge
      variant="muted"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border-none",
        className
      )}
    >
      {isNew ? "New" : "Used"}
    </Badge>
  );
}

/**
 * Attribute chip with checkmark or X
 */
export function AttributeChip({
  label,
  value,
  className,
}: {
  label: string;
  value: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant="muted"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 bg-[#BD9BBB]/10 text-[#824F8D] border-none",
        className
      )}
    >
      {value ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}
      <span>{label}</span>
    </Badge>
  );
}

/**
 * "+N more" chip for truncated attributes
 */
export function MoreChip({
  count,
  onClick,
  className,
}: {
  count: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Badge
      variant="muted"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 border-none cursor-pointer hover:bg-gray-200",
        className
      )}
      onClick={onClick}
    >
      +{count} more
    </Badge>
  );
}


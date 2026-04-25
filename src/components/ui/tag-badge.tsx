
import { cn } from "@/lib/utils";
import { Tag } from "@/lib/types";

interface TagBadgeProps {
  tag: Tag;
  className?: string;
  showPlus?: boolean;
}

export function TagBadge({ tag, className, showPlus = true }: TagBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap",
        tag.type === 'system' 
          ? "bg-[#E9E9E9] text-gray-900 hover:bg-[#DEDEE0]" 
          : tag.type === 'urgency'
          ? "bg-amber-50 text-amber-700 border border-amber-100"
          : "bg-gray-50 text-gray-600 border border-gray-100",
        className
      )}
    >
      {showPlus && <span className="mr-1.5 text-[15px] font-normal text-gray-500">#</span>}
      {tag.name}
    </div>
  );
}

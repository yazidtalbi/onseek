import Link from "next/link";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RequestItem } from "@/lib/types";

const statusStyles: Record<string, "default" | "muted" | "outline"> = {
  open: "default",
  closed: "outline",
  solved: "muted",
};

function RequestCardGridComponent({ request }: { request: RequestItem }) {
  const timeAgo = new Date(request.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  
  return (
    <Card className="border-border bg-card hover:shadow-lg transition-all h-full flex flex-col">
      <CardContent className="p-4 flex flex-col flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={statusStyles[request.status]} className="shrink-0 text-xs">
            {request.status.toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
        </div>
        
        <div className="flex-1 space-y-2">
          <Link 
            href={`/app/requests/${request.id}`}
            prefetch={true}
            className="text-base font-semibold leading-tight hover:text-primary transition-colors line-clamp-2 block"
          >
            {request.title}
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {request.description}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <span className="font-medium">{request.category}</span>
          {request.country ? <span>· {request.country}</span> : null}
          {request.condition ? <span>· {request.condition}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export const RequestCardGrid = memo(RequestCardGridComponent);


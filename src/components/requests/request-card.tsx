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

function RequestCardComponent({ request }: { request: RequestItem }) {
  const timeAgo = new Date(request.created_at).toLocaleDateString("en-US", {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "short",
  });
  
  return (
    <Card className="border-border bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Link 
                  href={`/app/requests/${request.id}`}
                  prefetch={true}
                  className="text-base font-semibold leading-tight hover:text-primary transition-colors"
                >
                  {request.title}
                </Link>
              </div>
              <Badge variant={statusStyles[request.status]} className="shrink-0">
                {request.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {request.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">{request.category}</span>
              {request.country ? <span>· {request.country}</span> : null}
              {request.condition ? <span>· {request.condition}</span> : null}
              <span className="ml-auto">Posted {timeAgo}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const RequestCard = memo(RequestCardComponent);


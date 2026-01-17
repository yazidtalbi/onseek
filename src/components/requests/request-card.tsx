import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RequestItem } from "@/lib/types";

const statusStyles: Record<string, "default" | "muted" | "outline"> = {
  open: "default",
  closed: "outline",
  solved: "muted",
};

export function RequestCard({ request }: { request: RequestItem }) {
  return (
    <Card className="border-border bg-white/80">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center justify-between">
          <Badge variant={statusStyles[request.status]}>
            {request.status.toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(request.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="space-y-2">
          <Link href={`/app/requests/${request.id}`} className="text-lg font-semibold">
            {request.title}
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {request.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{request.category}</span>
          {request.country ? <span>· {request.country}</span> : null}
          {request.condition ? <span>· {request.condition}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}


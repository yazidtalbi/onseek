import Link from "next/link";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Package, Settings, DollarSign } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RequestItem } from "@/lib/types";

const statusStyles: Record<string, "default" | "muted" | "outline"> = {
  open: "default",
  closed: "outline",
  solved: "muted",
};

function cleanDescription(description: string) {
  return description.replace(/<!--REQUEST_PREFS:.*?-->/, "").trim();
}

function parseRequestPreferences(description: string) {
  const match = description.match(/<!--REQUEST_PREFS:({.*?})-->/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

function RequestCardGridComponent({ request }: { request: RequestItem }) {
  const timeAgo = new Date(request.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  const cleanDesc = cleanDescription(request.description);
  const preferences = parseRequestPreferences(request.description) || {
    priceLock: "open",
    exactItem: false,
    exactSpecification: false,
    exactPrice: false,
  };
  const hasOptions = preferences.priceLock === "locked" || preferences.exactItem || preferences.exactSpecification || preferences.exactPrice;
  
  return (
    <Link href={`/app/requests/${request.id}`} prefetch={true} className="block h-full">
      <Card className="border-border bg-card h-full flex flex-col hover:border-foreground/30 transition-colors cursor-pointer min-h-[320px]">
        <CardContent className="p-6 flex flex-col flex-1 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <Badge variant={statusStyles[request.status]} className="shrink-0">
              {request.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold leading-tight text-foreground line-clamp-2">
                {request.title}
              </h3>
              {(request.budget_min || request.budget_max) && (
                <p className="text-xl font-bold text-foreground">
                  {request.budget_min && request.budget_max ? (
                    <>${request.budget_min} - ${request.budget_max}</>
                  ) : request.budget_min ? (
                    <>From ${request.budget_min}</>
                  ) : (
                    <>Up to ${request.budget_max}</>
                  )}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
              {cleanDesc}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <Badge variant="muted">{request.category}</Badge>
            {request.country ? <Badge variant="muted">{request.country}</Badge> : null}
            {request.condition ? <Badge variant="muted">{request.condition}</Badge> : null}
            
            {/* Request Options Icons */}
            {hasOptions && (
              <TooltipProvider>
                <div className="flex items-center gap-1.5 ml-auto">
                  {preferences.priceLock === "locked" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Price locked</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {preferences.exactItem && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exact item</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {preferences.exactSpecification && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exact specification</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {preferences.exactPrice && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exact price</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export const RequestCardGrid = memo(RequestCardGridComponent);


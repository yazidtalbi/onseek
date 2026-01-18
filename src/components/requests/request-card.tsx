import Link from "next/link";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, Package, Lock, Settings, DollarSign } from "lucide-react";
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

const statusLabels: Record<string, string> = {
  open: "AVAILABLE",
  closed: "CLOSED",
  solved: "SOLVED",
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

function RequestCardComponent({ request }: { request: RequestItem }) {
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
    <Link href={`/app/requests/${request.id}`} prefetch={true} className="block">
      <Card className="border-border bg-card hover:border-foreground/30 transition-colors cursor-pointer">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold leading-tight text-foreground">
                  {request.title}
                </h3>
                <CheckCircle2 className="h-5 w-5 text-foreground shrink-0" />
              </div>
              {(request.budget_min || request.budget_max) && (
                <p className="text-xl font-bold text-foreground mt-1">
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
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge variant={statusStyles[request.status]} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${
                request.status === 'open' ? 'bg-green-500' : 
                request.status === 'solved' ? 'bg-gray-500' : 'bg-gray-400'
              }`} />
              {statusLabels[request.status]}
            </Badge>
            {request.country && (
              <Badge variant="muted" className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {request.country}
              </Badge>
            )}
            {request.condition && (
              <Badge variant="muted" className="flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                {request.condition}
              </Badge>
            )}
            <Badge variant="muted" className="uppercase">
              {request.category}
            </Badge>
          </div>

          {/* Description Section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Request details</h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {cleanDesc}
            </p>
          </div>
          
          {/* Request Options Icons */}
          {hasOptions && (
            <TooltipProvider>
              <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>
    </Link>
  );
}

export const RequestCard = memo(RequestCardComponent);


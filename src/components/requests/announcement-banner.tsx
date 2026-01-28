"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <Card className="">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5 text-[#FF5F00]" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-neutral-900 text-sm">
              This request has extra points
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              For hard questions, that don't get solved in time, automatic or manual bounty points will be added. Answer it, and they will be yours!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


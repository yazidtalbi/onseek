"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestForm } from "./request-form";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCountry?: string | null;
}

export function CreateRequestModal({
  open,
  onOpenChange,
  userCountry,
}: CreateRequestModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
        <DialogHeader className="p-8 pb-4 flex flex-row items-center justify-between space-y-0 text-foreground">
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-expanded)' }}>
                Create a request
              </DialogTitle>
              <p className="text-sm text-gray-500 font-medium">Fast, simple, and exactly what you need.</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-gray-100 h-10 w-10"
          >
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </DialogHeader>

        <div className="px-8 pb-0 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <RequestForm 
            isModal={true} 
            userCountry={userCountry} 
            onSuccess={handleSuccess} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

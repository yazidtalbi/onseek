"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
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
  const [currentStep, setCurrentStep] = React.useState(1);
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
        <DialogHeader className="p-8 flex flex-row items-center justify-between space-y-0 text-foreground border-none">
          {currentStep === 1 && (
            <h2 className="text-xl text-black animate-in fade-in slide-in-from-left-4 duration-500" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
              First, what are you looking for?
            </h2>
          )}
          {currentStep === 2 && (
            <h2 className="text-xl text-black animate-in fade-in slide-in-from-left-4 duration-500" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
              Next, set your budget & condition.
            </h2>
          )}
          {currentStep === 3 && (
            <h2 className="text-xl text-black animate-in fade-in slide-in-from-left-4 duration-500" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
              Now, add your preferences & dealbreakers.
            </h2>
          )}
          <div className={cn("flex-1", currentStep !== 1 && "hidden")} /> {/* Spacer for Step 1 if needed, but justify-between handles it */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-gray-100 h-10 w-10 shrink-0"
          >
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </DialogHeader>

        <div className="px-8 pb-0 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <RequestForm 
            isModal={true} 
            userCountry={userCountry} 
            onSuccess={handleSuccess} 
            onStepChange={setCurrentStep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

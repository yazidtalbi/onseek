"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { RequestForm } from "./request-form";
import { X } from "lucide-react";
import type { RequestItem } from "@/lib/types";

interface EditRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: RequestItem & { images?: string[]; links?: string[] };
}

export function EditRequestModal({
  open,
  onOpenChange,
  initialData,
}: EditRequestModalProps) {
  const [currentStep, setCurrentStep] = React.useState(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 overflow-hidden rounded-[1.5rem] border-none shadow-2xl bg-white flex flex-col transition-all duration-500 ease-in-out",
        (currentStep === 7 || currentStep === 8) ? "sm:max-w-[880px] w-full" : "sm:max-w-[620px] w-full"
      )}>
        {/* Contextual Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 z-[60] p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100/50 z-50 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#7755FF] to-[#f89131] transition-all duration-500 ease-out" 
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        <div className={cn(
          "px-8 pb-0 pt-12",
          "max-h-[85vh] overflow-y-auto custom-scrollbar"
        )}>
          <RequestForm 
            isModal={true} 
            initialData={initialData}
            onSuccess={() => onOpenChange(false)} 
            onCancel={() => onOpenChange(false)}
            onStepChange={setCurrentStep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

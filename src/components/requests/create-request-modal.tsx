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
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && currentStep > 1) {
      setShowConfirm(true);
      return;
    }
    onOpenChange(isOpen);
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    onOpenChange(false);
    setCurrentStep(1); // Reset for next time
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={cn(
          "p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white flex flex-col transition-all duration-500 ease-in-out",
          (currentStep === 7 || currentStep === 8) ? "sm:max-w-[880px] w-full" : "sm:max-w-[620px] w-full"
        )}>
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100/50 z-50 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#7755FF] to-[#f89131] transition-all duration-500 ease-out" 
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>

          <div className={cn(
            "px-8 pb-0 pt-12",
            currentStep === 8 ? "overflow-visible" : "max-h-[85vh] overflow-y-auto custom-scrollbar"
          )}>
            <RequestForm 
              isModal={true} 
              userCountry={userCountry} 
              onSuccess={() => onOpenChange(false)} 
              onCancel={() => handleOpenChange(false)}
              onStepChange={setCurrentStep}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[400px] p-8 rounded-[2rem] gap-6 border-none shadow-2xl">
          <div className="space-y-3 text-center">
            <h3 className="text-xl font-bold text-[#222234]" style={{ fontFamily: 'var(--font-expanded)' }}>Discard request?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">You'll lose all the information you've entered so far. This action cannot be undone.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button 
              variant="ghost" 
              onClick={handleConfirmClose}
              className="w-full h-12 rounded-full font-bold text-red-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              Discard Changes
            </Button>
            <Button 
              onClick={() => setShowConfirm(false)}
              className="w-full h-12 rounded-full font-bold bg-[#222234] hover:bg-[#2a2a4f] text-white shadow-lg shadow-gray-200"
            >
              Keep Editing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

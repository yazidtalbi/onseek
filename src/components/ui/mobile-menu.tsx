"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

interface MobileMenuProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileMenu({ trigger, children, open, onOpenChange }: MobileMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  return (
    <>
      <div onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
      }}>
        {trigger || (
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="fixed bottom-0 top-auto translate-y-0 w-full p-4 rounded-t-[32px] border-none shadow-2xl transition-all duration-300 ease-out left-1/2 -translate-x-1/2"
          overlayClassName="bg-black/70 backdrop-blur-0"
        >
          <div className="sr-only">
            <DialogTitle>Menu</DialogTitle>
            <DialogDescription>Select an action</DialogDescription>
          </div>
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
          <div className="max-h-[70vh] overflow-y-auto pb-8 flex flex-col gap-1">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function MobileMenuItem({ 
  children, 
  onClick, 
  className,
  variant = "default"
}: { 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void; 
  className?: string;
  variant?: "default" | "danger" | "amber";
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "flex items-center w-full px-4 py-4 text-[16px] font-medium rounded-2xl transition-colors text-left",
        variant === "default" && "text-gray-700 hover:bg-gray-100 active:bg-gray-100",
        variant === "danger" && "text-red-600 hover:bg-red-50 active:bg-red-50",
        variant === "amber" && "text-amber-600 hover:bg-amber-50 active:bg-amber-50",
        className
      )}
    >
      {children}
    </button>
  );
}

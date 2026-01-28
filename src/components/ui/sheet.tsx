import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    noBlur?: boolean;
  }
>(({ className, noBlur, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      noBlur ? "" : "bg-black/40 backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right" | "top" | "bottom";
    fullScreen?: boolean;
    noBlur?: boolean;
  }
>(({ side = "right", fullScreen = false, noBlur = false, className, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay noBlur={noBlur} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 w-full gap-4 border border-[#e5e7eb]  p-6",
        fullScreen && "inset-0 h-full w-full max-w-none rounded-none border-0",
        !fullScreen && side === "right" &&
          "right-0 top-0 h-full max-w-sm rounded-l-3xl",
        !fullScreen && side === "left" &&
          "left-0 top-0 h-full max-w-sm rounded-r-3xl",
        !fullScreen && side === "top" && "left-0 top-0 w-full rounded-b-3xl",
        !fullScreen && side === "bottom" && "bottom-0 left-0 w-full rounded-t-3xl",
        className
      )}
      {...props}
    />
  </SheetPortal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent };


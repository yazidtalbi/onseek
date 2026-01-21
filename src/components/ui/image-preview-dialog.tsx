"use client";

import * as React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImagePreviewDialogProps {
  imageUrl?: string;
  images?: string[];
  currentIndex?: number;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({
  imageUrl,
  images,
  currentIndex = 0,
  alt,
  open,
  onOpenChange,
}: ImagePreviewDialogProps) {
  // Support both single image and multiple images
  const imageList = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
  const [activeIndex, setActiveIndex] = React.useState(currentIndex);

  // Update active index when currentIndex prop changes
  React.useEffect(() => {
    if (currentIndex !== undefined && currentIndex >= 0 && currentIndex < imageList.length) {
      setActiveIndex(currentIndex);
    }
  }, [currentIndex, imageList.length]);

  const currentImage = imageList[activeIndex];
  const hasMultipleImages = imageList.length > 1;
  const canGoPrevious = hasMultipleImages && activeIndex > 0;
  const canGoNext = hasMultipleImages && activeIndex < imageList.length - 1;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoPrevious) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoNext) {
      setActiveIndex(activeIndex + 1);
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!open || !hasMultipleImages) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canGoPrevious) {
        setActiveIndex(activeIndex - 1);
      } else if (e.key === "ArrowRight" && canGoNext) {
        setActiveIndex(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, hasMultipleImages, activeIndex, canGoPrevious, canGoNext]);

  if (!currentImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/80 !z-[10]" />
      <DialogContent
        className={cn(
          "max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-0 bg-transparent shadow-none",
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Previous button */}
          {hasMultipleImages && canGoPrevious && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next button */}
          {hasMultipleImages && canGoNext && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image counter */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {activeIndex + 1} / {imageList.length}
            </div>
          )}

          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <Image
              src={currentImage}
              alt={`${alt} - Image ${activeIndex + 1}`}
              width={1920}
              height={1080}
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


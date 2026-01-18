"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ImageCarousel({
  images,
  initialIndex = 0,
}: {
  images: { id: string; image_url: string }[];
  initialIndex?: number;
}) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const openCarousel = (index: number) => {
    setSelectedIndex(index);
    setCurrentIndex(index);
  };

  const closeCarousel = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = React.useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  React.useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        closeCarousel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, goToPrevious, goToNext]);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="flex flex-wrap gap-2">
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openCarousel(index)}
            className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-100 hover:border-foreground/50 transition-colors cursor-pointer group"
          >
            <Image
              src={img.image_url}
              alt={`Image ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Fullscreen Carousel */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeCarousel}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none rounded-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeCarousel}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Previous Button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 z-50 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Image */}
            <div className="relative w-full h-full flex items-center justify-center p-12">
              <Image
                src={images[currentIndex]?.image_url || ""}
                alt={`Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 z-50 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


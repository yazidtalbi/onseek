"use client";

import * as React from "react";
import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/actions/favorite.actions";
import { useAuth } from "@/components/layout/auth-provider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  requestId,
  isFavorite: initialIsFavorite,
}: {
  requestId: string;
  isFavorite?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = React.useState(initialIsFavorite || false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("requestId", requestId);
      const result = await toggleFavoriteAction(formData);
      
      if (result?.success) {
        setIsFavorite(result.isFavorite);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center rounded-full p-2 transition-colors",
        isFavorite
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-foreground"
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          isFavorite && "fill-current"
        )}
      />
    </button>
  );
}


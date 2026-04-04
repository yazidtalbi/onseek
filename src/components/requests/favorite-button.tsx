"use client";

import * as React from "react";
import { useTransition } from "react";
import { Bookmark } from "lucide-react";
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
  const [optimisticFavorite, addOptimisticFavorite] = React.useOptimistic(
    initialIsFavorite || false,
    (state, newState: boolean) => newState
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    startTransition(async () => {
      const newFavoriteState = !optimisticFavorite;
      // Toggle optimistic state immediately
      addOptimisticFavorite(newFavoriteState);

      const formData = new FormData();
      formData.set("requestId", requestId);
      await toggleFavoriteAction(formData);
      
      // We don't strictly need to set state here because router.refresh() 
      // or the optimistic state handling will take care of it,
      // but adding optimistic favorite helps the UI feel instant.
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center rounded-full p-2 transition-colors",
        optimisticFavorite
          ? "text-amber-600 hover:text-amber-700"
          : "text-gray-600 hover:text-gray-400"
      )}
      aria-label={optimisticFavorite ? "Remove from saved" : "Save request"}
    >
      <Bookmark
        className={cn(
          "h-5 w-5 transition-all",
          optimisticFavorite && "fill-current"
        )}
      />
    </button>
  );
}


"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { markSolvedAction } from "@/actions/request.actions";
import { Button } from "@/components/ui/button";

export function WinnerButton({
  requestId,
  submissionId,
  disabled,
  onSelected,
}: {
  requestId: string;
  submissionId: string;
  disabled?: boolean;
  onSelected?: (submissionId: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleClick = () => {
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("submissionId", submissionId);
    startTransition(async () => {
      const res = await markSolvedAction(formData);
      if (!res?.error) {
        onSelected?.(submissionId);
        router.refresh();
      }
    });
  };

  return (
    <Button
      type="button"
      variant="accent"
      size="sm"
      onClick={handleClick}
      disabled={disabled || isPending}
    >
      {isPending ? "Selecting..." : "Select winner"}
    </Button>
  );
}


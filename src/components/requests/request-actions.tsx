"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateRequestStatusAction } from "@/actions/request.actions";
import { Button } from "@/components/ui/button";

export function RequestActions({
  requestId,
  status,
}: {
  requestId: string;
  status: "open" | "closed" | "solved";
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleUpdate = (nextStatus: string) => {
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("status", nextStatus);
    startTransition(async () => {
      const res = await updateRequestStatusAction(formData);
      if (!res?.error) {
        router.refresh();
      }
    });
  };

  if (status !== "open") {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => handleUpdate("closed")}
      disabled={isPending}
    >
      {isPending ? "Closing..." : "Close request"}
    </Button>
  );
}


"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { submissionSchema } from "@/lib/validators";
import { createSubmissionAction } from "@/actions/submission.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Values = z.infer<typeof submissionSchema>;

export function SubmissionForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      url: "",
      storeName: "",
      price: null,
      shippingCost: null,
      notes: "",
    },
  });

  const onSubmit = (values: Values) => {
    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("url", values.url);
    formData.set("storeName", values.storeName || "");
    formData.set(
      "price",
      Number.isFinite(values.price) ? String(values.price) : ""
    );
    formData.set(
      "shippingCost",
      Number.isFinite(values.shippingCost) ? String(values.shippingCost) : ""
    );
    formData.set("notes", values.notes || "");
    startTransition(async () => {
      const res = await createSubmissionAction(formData);
      setError(res?.error || null);
      if (!res?.error) {
        form.reset();
        // Invalidate React Query cache for submissions
        queryClient.invalidateQueries({ queryKey: ["submissions", requestId] });
        // Refresh server components to get updated data
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="url">Product URL</Label>
        <Input id="url" type="url" {...form.register("url")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="storeName">Store name</Label>
        <Input id="storeName" {...form.register("storeName")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register("price", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingCost">Shipping cost</Label>
          <Input
            id="shippingCost"
            type="number"
            step="0.01"
            {...form.register("shippingCost", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Why it matches</Label>
        <Textarea id="notes" {...form.register("notes")} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit link"}
      </Button>
    </form>
  );
}


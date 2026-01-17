"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { requestSchema } from "@/lib/validators";
import { createRequestAction } from "@/actions/request.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RequestValues = z.infer<typeof requestSchema>;

export function RequestForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Tech",
      budgetMin: null,
      budgetMax: null,
      country: "",
      condition: "New",
      urgency: "Standard",
      referenceLinks: "",
    },
  });

  const onSubmit = (values: RequestValues) => {
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("description", values.description);
    formData.set("category", values.category);
    formData.set(
      "budgetMin",
      Number.isFinite(values.budgetMin) ? String(values.budgetMin) : ""
    );
    formData.set(
      "budgetMax",
      Number.isFinite(values.budgetMax) ? String(values.budgetMax) : ""
    );
    formData.set("country", values.country || "");
    formData.set("condition", values.condition || "");
    formData.set("urgency", values.urgency || "");
    if (values.referenceLinks) {
      formData.set("referenceLinks", values.referenceLinks);
    }
    startTransition(async () => {
      const res = await createRequestAction(formData);
      setError(res?.error || null);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.watch("category")}
            onValueChange={(value) => form.setValue("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {["Tech", "Home", "Fashion", "Auto", "Collectibles", "Local"].map(
                (category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Condition</Label>
          <Select
            value={form.watch("condition") || "New"}
            onValueChange={(value) => form.setValue("condition", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              {["New", "Used", "Either"].map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Urgency</Label>
          <Select
            value={form.watch("urgency") || "Standard"}
            onValueChange={(value) => form.setValue("urgency", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              {["ASAP", "This week", "Standard"].map((urgency) => (
                <SelectItem key={urgency} value={urgency}>
                  {urgency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...form.register("country")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budgetMin">Budget min</Label>
          <Input
            id="budgetMin"
            type="number"
            step="0.01"
            {...form.register("budgetMin", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budgetMax">Budget max</Label>
          <Input
            id="budgetMax"
            type="number"
            step="0.01"
            {...form.register("budgetMax", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="referenceLinks">Reference links (comma separated)</Label>
        <Input id="referenceLinks" {...form.register("referenceLinks")} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
        {isPending ? "Publishing..." : "Publish request"}
      </Button>
    </form>
  );
}


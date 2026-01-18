"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { CountryCombobox } from "@/components/ui/country-combobox";

type RequestValues = z.infer<typeof requestSchema>;

export function RequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<RequestValues>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      category: "Tech",
      budgetMin: null,
      budgetMax: null,
      priceLock: "open",
      exactItem: false,
      exactSpecification: false,
      exactPrice: false,
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
    formData.set("priceLock", values.priceLock || "open");
    formData.set("exactItem", values.exactItem ? "true" : "false");
    formData.set("exactSpecification", values.exactSpecification ? "true" : "false");
    formData.set("exactPrice", values.exactPrice ? "true" : "false");
    if (values.referenceLinks) {
      formData.set("referenceLinks", values.referenceLinks);
    }
    startTransition(async () => {
      // Invalidate React Query cache before creating request
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      // Refresh server components
      router.refresh();
      
      const res = await createRequestAction(formData);
      if (res?.error) {
        setError(res.error);
      }
      // If no error, redirect happens in server action
      // But we've already invalidated the cache, so when user navigates back, data will be fresh
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
          <CountryCombobox
            value={form.watch("country") || null}
            onChange={(value) => form.setValue("country", value || null)}
            placeholder="Select or type country"
          />
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
      
      {/* Price Lock Option */}
      <div className="space-y-2">
        <Label>Price</Label>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="priceOpen"
              value="open"
              {...form.register("priceLock")}
              className="h-4 w-4"
            />
            <Label htmlFor="priceOpen" className="text-sm font-normal cursor-pointer">
              Open (allow price suggestions)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="priceLocked"
              value="locked"
              {...form.register("priceLock")}
              className="h-4 w-4"
            />
            <Label htmlFor="priceLocked" className="text-sm font-normal cursor-pointer">
              Locked (no price greater than specified)
            </Label>
          </div>
        </div>
      </div>

      {/* Request Options */}
      <div className="space-y-3">
        <Label>Request Options</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="exactItem"
              className="h-4 w-4 rounded border-border"
              {...form.register("exactItem")}
            />
            <Label htmlFor="exactItem" className="text-sm font-normal cursor-pointer">
              Exact item (no alternatives)
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="exactSpecification"
              className="h-4 w-4 rounded border-border"
              {...form.register("exactSpecification")}
            />
            <Label htmlFor="exactSpecification" className="text-sm font-normal cursor-pointer">
              Exact specification
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="exactPrice"
              className="h-4 w-4 rounded border-border"
              {...form.register("exactPrice")}
            />
            <Label htmlFor="exactPrice" className="text-sm font-normal cursor-pointer">
              Exact price
            </Label>
          </div>
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


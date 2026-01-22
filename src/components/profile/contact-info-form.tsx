"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { contactInfoSchema } from "@/lib/validators";
import type { Profile } from "@/lib/types";
import { updateContactInfoAction } from "@/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Values = z.infer<typeof contactInfoSchema>;

export function ContactInfoForm({ profile }: { profile: Profile }) {
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      contactEmail: profile.contact_email || "",
      contactPhone: profile.contact_phone || "",
      contactWhatsapp: profile.contact_whatsapp || "",
      contactTelegram: profile.contact_telegram || "",
      contactPreferred: profile.contact_preferred || null,
    },
  });

  const onSubmit = (values: Values) => {
    const formData = new FormData();
    formData.set("contactEmail", values.contactEmail?.trim() || "");
    formData.set("contactPhone", values.contactPhone?.trim() || "");
    formData.set("contactWhatsapp", values.contactWhatsapp?.trim() || "");
    formData.set("contactTelegram", values.contactTelegram?.trim() || "");
    formData.set("contactPreferred", values.contactPreferred || "");
    startTransition(async () => {
      const res = await updateContactInfoAction(formData);
      if (res?.error) {
        setError(res.error);
        setStatus(null);
      } else {
        setError(null);
        setStatus("Contact information updated.");
        // Reset form with new values
        form.reset({
          contactEmail: values.contactEmail?.trim() || "",
          contactPhone: values.contactPhone?.trim() || "",
          contactWhatsapp: values.contactWhatsapp?.trim() || "",
          contactTelegram: values.contactTelegram?.trim() || "",
          contactPreferred: values.contactPreferred || null,
        });
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="contactEmail">Email</Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="your.email@example.com"
          {...form.register("contactEmail")}
        />
        {form.formState.errors.contactEmail ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.contactEmail.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactPhone">Phone</Label>
        <Input
          id="contactPhone"
          type="tel"
          placeholder="+1234567890"
          {...form.register("contactPhone")}
        />
        {form.formState.errors.contactPhone ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.contactPhone.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactWhatsapp">WhatsApp</Label>
        <Input
          id="contactWhatsapp"
          type="tel"
          placeholder="+1234567890"
          {...form.register("contactWhatsapp")}
        />
        {form.formState.errors.contactWhatsapp ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.contactWhatsapp.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactTelegram">Telegram</Label>
        <Input
          id="contactTelegram"
          type="text"
          placeholder="@username"
          {...form.register("contactTelegram")}
        />
        {form.formState.errors.contactTelegram ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.contactTelegram.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactPreferred">Preferred contact method</Label>
        <Select
          value={form.watch("contactPreferred") || "none"}
          onValueChange={(value) => {
            form.setValue("contactPreferred", value === "none" ? null : (value as any));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preferred method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800">
          Your contact information will only be visible to request owners when they view your personal item submissions.
        </p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save contact information"}
      </Button>
    </form>
  );
}


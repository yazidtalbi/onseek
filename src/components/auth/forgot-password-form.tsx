"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/actions/auth.actions";

type Values = { email: string };

export function ForgotPasswordForm() {
  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<Values>({ defaultValues: { email: "" } });

  const onSubmit = (values: Values) => {
    const formData = new FormData();
    formData.set("email", values.email);
    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      if (res?.error) {
        setError(res.error);
        setStatus(null);
      } else {
        setError(null);
        setStatus("Check your email for the reset link.");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
        {isPending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}


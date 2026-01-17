"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "@/actions/auth.actions";

type Values = { password: string };

export function ResetPasswordForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<Values>({ defaultValues: { password: "" } });

  const onSubmit = (values: Values) => {
    const formData = new FormData();
    formData.set("password", values.password);
    startTransition(async () => {
      const res = await updatePasswordAction(formData);
      setError(res?.error || null);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" {...form.register("password")} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
        {isPending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}


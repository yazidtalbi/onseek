"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { signUpSchema } from "@/lib/validators";
import { signUpAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      displayName: "",
    },
  });

  const onSubmit = (values: SignUpValues) => {
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("username", values.username);
    formData.set("displayName", values.displayName);
    startTransition(async () => {
      const res = await signUpAction(formData);
      setError(res?.error || null);
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" {...form.register("displayName")} />
        {form.formState.errors.displayName ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.displayName.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...form.register("username")} />
        {form.formState.errors.username ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.username.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="accent" className="w-full">
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}


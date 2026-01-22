"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validators";
import type { z } from "zod";
import { signInAction } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SignInValues = z.infer<typeof signInSchema>;

export function LoginDropdown() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);

      const result = await signInAction(formData);

      if (result?.error) {
        setError(result.error);
        setIsPending(false);
        return;
      }

      // If no error, redirect happened in server action
      // But if we're here, redirect manually as fallback
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      // redirect() throws NEXT_REDIRECT - catch it and redirect manually
      if (err && typeof err === "object" && "digest" in err) {
        const digest = String((err as { digest?: unknown }).digest);
        if (digest.includes("NEXT_REDIRECT")) {
          setOpen(false);
          router.push("/");
          router.refresh();
          return;
        }
      }
      setError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors hidden sm:block">
          Log In
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input id="login-email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input id="login-password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


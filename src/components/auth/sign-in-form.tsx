"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validators";
import type { z } from "zod";
import { signInAction } from "@/actions/auth.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
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
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      // redirect() throws NEXT_REDIRECT - catch it and redirect manually
      if (err && typeof err === "object" && "digest" in err) {
        const digest = String((err as { digest?: unknown }).digest);
        if (digest.includes("NEXT_REDIRECT")) {
          router.push(redirectTo);
          router.refresh();
          return;
        }
      }
      setError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  const handleGoogle = async () => {
    const supabase = (await import("@/lib/supabase/client")).createBrowserSupabaseClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="space-y-2">
        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

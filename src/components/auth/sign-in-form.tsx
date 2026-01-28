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
import { Loader2 } from "lucide-react";

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { emailOrUsername: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("emailOrUsername", values.emailOrUsername);
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
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sign In Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11  border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium"
        onClick={handleGoogle}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className=" px-2 text-gray-500">OR SIGN IN WITH</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email or Username</Label>
          <Input id="email" type="text" placeholder="Enter your email or username" {...form.register("emailOrUsername")} />
          {form.formState.errors.emailOrUsername && (
            <p className="text-xs text-red-600">{form.formState.errors.emailOrUsername.message}</p>
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
        <Button
          type="submit"
          className="w-full h-11 bg-[#222234] hover:bg-[#222234]/90 text-white font-medium"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  );
}

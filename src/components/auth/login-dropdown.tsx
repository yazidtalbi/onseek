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
import { Loader2 } from "lucide-react";
import Link from "next/link";
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
      <DropdownMenuContent align="end" className="w-96 p-6  border border-gray-200 shadow-lg mt-2">
        <div className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="login-email-username" className="text-sm font-medium text-gray-700">
                Email or Username
              </Label>
              <Input 
                id="login-email-username" 
                type="text" 
                placeholder="Enter your email or username"
                className="h-11  border-gray-300 focus:border-[#7755FF] focus:ring-[#7755FF]"
                {...form.register("emailOrUsername")} 
              />
              {form.formState.errors.emailOrUsername && (
                <p className="text-xs text-red-600">{form.formState.errors.emailOrUsername.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input 
                id="login-password" 
                type="password" 
                placeholder="Enter your password"
                className="h-11  border-gray-300 focus:border-[#7755FF] focus:ring-[#7755FF]"
                {...form.register("password")} 
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-11 bg-[#222234] hover:bg-[#222234]/90 text-white font-medium rounded-full" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "LOGIN"
              )}
            </Button>
          </form>
          
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#7755FF] hover:text-[#6644EE]">
                Register HERE
              </Link>
            </div>
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-600 hover:text-[#7755FF] transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


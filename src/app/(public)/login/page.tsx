import Link from "next/link";
import { AuthCard } from "@/components/layout/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <AuthCard
        title="Welcome back"
        subtitle="Log in to track requests and share winning links."
      >
        <SignInForm />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/forgot-password">Forgot password?</Link>
          <Link href="/signup" className="font-semibold text-foreground">
            Create account
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}


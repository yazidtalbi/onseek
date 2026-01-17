import Link from "next/link";
import { AuthCard } from "@/components/layout/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <AuthCard
        title="Join Onseek"
        subtitle="Start requesting and earn reputation by finding the best links."
      >
        <SignUpForm />
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}


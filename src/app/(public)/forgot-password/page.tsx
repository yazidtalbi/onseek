import Link from "next/link";
import { AuthCard } from "@/components/layout/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <AuthCard
        title="Reset your password"
        subtitle="We'll email you a secure link to set a new password."
      >
        <ForgotPasswordForm />
        <div className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-foreground">
            Back to login
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}


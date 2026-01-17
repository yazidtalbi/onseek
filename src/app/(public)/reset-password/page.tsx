import { AuthCard } from "@/components/layout/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <AuthCard
        title="Set a new password"
        subtitle="Choose a secure password to get back to Onseek."
      >
        <ResetPasswordForm />
      </AuthCard>
    </div>
  );
}


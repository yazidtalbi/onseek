import { SignUpForm } from "@/components/auth/sign-up-form";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <AuthCardLayout
      title="Create account"
      description="Join our community of 50,000+ members and start making requests today."
    >
      <div className="space-y-6">
        <SignUpForm />
        
        <div className="mt-6 text-sm">
          <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
            Already using Onseek? <span className="font-semibold text-gray-900 hover:underline">Sign in</span>
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
}

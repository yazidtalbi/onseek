import { SignInForm } from "@/components/auth/sign-in-form";
import { AuthCardLayout } from "@/components/auth/auth-card-layout";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthCardLayout
      title="Welcome back"
      description="Sign in to your account to continue and manage your requests."
    >
      <div className="space-y-6">
        <SignInForm />
        
        <div className="mt-6 flex flex-col gap-4 text-sm">
          <Link href="/signup" className="text-gray-500 hover:text-gray-900 transition-colors">
            Don't have an account? <span className="font-semibold text-gray-900 hover:underline">Sign up</span>
          </Link>
          <Link href="/forgot-password" university-auth-link="true" className="text-gray-400 hover:text-gray-600 transition-colors w-fit">
            Forgot password?
          </Link>
        </div>
      </div>
    </AuthCardLayout>
  );
}

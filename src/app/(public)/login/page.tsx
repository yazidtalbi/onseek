import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { LoginInfoSection } from "@/components/auth/login-info-section";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Column - Login Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12 lg:py-16 ">
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <Link href="/" className="inline-block mb-8 text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
              onseek
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h1>

            {/* Form */}
            <div className="mt-8">
              <SignInForm />
            </div>

            {/* Links */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-gray-600 hover:text-gray-900">
                Forgot password?
              </Link>
              <span className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-gray-900 hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Info Section */}
        <div className="hidden lg:flex flex-col justify-center px-12 py-16 bg-gray-50">
          <div className="max-w-md mx-auto w-full">
            <LoginInfoSection />
          </div>
        </div>
      </div>
    </div>
  );
}


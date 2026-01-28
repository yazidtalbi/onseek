import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { TestimonialCarousel } from "@/components/auth/testimonial-carousel";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Column - Signup Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12 lg:py-16 ">
          <div className="max-w-md mx-auto w-full">
            {/* Logo */}
            <Link href="/" className="inline-block mb-8 text-xl text-black" style={{ fontFamily: 'var(--font-expanded)', fontWeight: 600 }}>
              onseek
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Sign up to Onseek
            </h1>

            {/* Form */}
            <div className="mt-8">
              <SignUpForm />
            </div>

            {/* Sign in link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Already using Onseek?{" "}
              <Link href="/login" className="font-semibold text-gray-900 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Testimonials */}
        <div className="hidden lg:flex flex-col justify-center px-12 py-16 bg-gray-50">
          <div className="max-w-md mx-auto w-full">
            <TestimonialCarousel />
          </div>
        </div>
      </div>
    </div>
  );
}


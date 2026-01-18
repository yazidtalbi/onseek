"use client";

import { useAuth } from "@/components/layout/auth-provider";
import { useRouter } from "next/navigation";

export function RequestInputSection() {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      router.push("/login?redirectTo=/app/new");
      return;
    }
    router.push("/app/new");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full h-14 rounded-2xl border border-[#e5e7eb] bg-white shadow-lg shadow-gray-200/50 px-4 text-left text-base text-gray-400 hover:border-gray-300 transition-colors"
    >
      What are you looking for?
    </button>
  );
}


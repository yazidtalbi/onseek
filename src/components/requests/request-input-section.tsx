"use client";

import { useAuth } from "@/components/layout/auth-provider";
import { useRouter } from "next/navigation";

export function RequestInputSection() {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      router.push("/signup");
      return;
    }
    router.push("/app/new");
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleClick}
        className="w-full min-h-[120px] rounded-2xl border border-[#e5e7eb] shadow-lg shadow-gray-200/50 px-6 py-4 text-left text-base text-gray-400 hover:border-gray-300 transition-colors flex items-start"
      >
        <span className="flex-1">What are you looking for?</span>
      </button>
      <div className="absolute right-4 bottom-4 pointer-events-none">
        <div className="px-4 py-2 rounded-full bg-[#f5f6f9] text-gray-400 text-sm font-medium">
          Post
        </div>
      </div>
    </div>
  );
}


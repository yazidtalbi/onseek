"use client";

import { useAuth } from "@/components/layout/auth-provider";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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
      className="w-full h-14 rounded-full border border-[#e5e7eb] bg-white shadow-lg shadow-gray-200/50 px-4 text-left text-base text-gray-400 hover:border-gray-300 transition-colors flex items-center gap-2"
    >
      <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
      What are you looking for?
    </button>
  );
}


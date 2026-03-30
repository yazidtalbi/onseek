"use client";

import { useAuth } from "@/components/layout/auth-provider";
import { useRouter } from "next/navigation";
import { CreateRequestModal } from "./create-request-modal";
import { useState } from "react";

export function RequestInputSection() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={handleClick}
        className="w-full min-h-[120px] rounded-2xl border border-[#e5e7eb] shadow-lg shadow-gray-200/50 px-6 py-4 text-left text-base text-gray-400 hover:border-gray-300 transition-colors flex items-start group"
      >
        <span className="flex-1 text-lg group-hover:text-gray-500 transition-colors">What are you looking for?</span>
      </button>
      <div className="absolute right-4 bottom-4 pointer-events-none">
        <div className="px-5 py-2.5 rounded-full bg-[#f5f6f9] text-gray-400 text-sm font-bold tracking-tight">
          Post
        </div>
      </div>

      <CreateRequestModal 
        open={showModal} 
        onOpenChange={setShowModal} 
        userCountry={profile?.country} 
      />
    </div>
  );
}


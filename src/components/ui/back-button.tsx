"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="flex items-center justify-center w-8 h-8 p-0 bg-gray-100 hover:bg-gray-200"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}


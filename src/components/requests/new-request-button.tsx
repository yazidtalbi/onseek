"use client";

import { Button } from "@/components/ui/button";

export function NewRequestButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-create-request-modal'));
  };

  return (
    <Button 
      onClick={handleClick} 
      className="h-11 rounded-full bg-[#7755FF] hover:bg-[#6644EE] text-white px-8 font-bold transition-colors"
    >
      New request
    </Button>
  );
}

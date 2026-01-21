"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function PromotionalSidebar() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-md sticky top-20">
      {/* Main Promotional Card */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">The network for requests</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Join thousands of members finding exactly what they need
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Connect with helpful community members, get quality submissions, and find the best deals
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Members have found over $1M in value through community recommendations
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/app/requests/new")}
          className="w-full bg-[#F2F3F5] text-[#363B40] hover:bg-[#F2F3F5]/90"
        >
          Create your first request
        </Button>
      </div>

      {/* Tips or Additional Info */}
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Tips for better requests</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-foreground mt-1">•</span>
            <span>Be specific about what you're looking for</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground mt-1">•</span>
            <span>Set a realistic budget range</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground mt-1">•</span>
            <span>Add reference links or images if available</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground mt-1">•</span>
            <span>Engage with submissions and provide feedback</span>
          </li>
        </ul>
      </div>

      {/* What is Onseek */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">What is Onseek?</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            Onseek is a community-driven platform where you post requests for products, services, or solutions and get quality submissions from helpful members.
          </p>
        </div>
      </div>
    </div>
  );
}


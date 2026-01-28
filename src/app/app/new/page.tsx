import { RequestForm } from "@/components/requests/request-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NewRequestPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold mb-2">
          Create a new request
        </h1>
        <p className="text-base text-gray-600">
          Share exactly what you need, and let the community bring you the best options.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RequestForm />
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[#e5e7eb]  p-6 space-y-4 sticky top-20">
            <h3 className="text-lg font-semibold text-foreground">Tips</h3>
            <ul className="space-y-3 text-base text-gray-600">
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
        </div>
      </div>
    </div>
  );
}


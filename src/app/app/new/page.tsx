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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Create a new request</h1>
        <p className="text-sm text-muted-foreground">
          Share exactly what you need, and let the community bring you the best options.
        </p>
      </div>
      <RequestForm />
    </div>
  );
}


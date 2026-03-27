import { RequestForm } from "@/components/requests/request-form";

export const dynamic = "force-dynamic";

export default function NewRequestPage() {
  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Create a new request
        </h1>
        <p className="text-base text-gray-600">
          Share exactly what you need, and let the community bring you the best options.
        </p>
      </div>
      <RequestForm />
    </div>
  );
}


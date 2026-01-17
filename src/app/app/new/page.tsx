import { RequestForm } from "@/components/requests/request-form";

export const dynamic = "force-dynamic";

export default function NewRequestPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Create a new request</h1>
        <p className="text-sm text-muted-foreground">
          Share exactly what you need, and let hunters bring you the best links.
        </p>
        <RequestForm />
      </div>
      <div className="rounded-3xl border border-border bg-white/80 p-6 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Tips for success</h2>
        <ul className="mt-3 space-y-2">
          <li>Be specific about brand, size, or features.</li>
          <li>Add a realistic budget range for better matches.</li>
          <li>Include reference links if you already found similar items.</li>
        </ul>
      </div>
    </div>
  );
}


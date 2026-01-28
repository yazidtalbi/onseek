"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { reportSchema } from "@/lib/validators";
import { createReportAction } from "@/actions/report.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Values = z.infer<typeof reportSchema>;

export function ReportDialog({
  type,
  targetId,
  open: controlledOpen,
  onOpenChange,
}: {
  type: "request" | "submission";
  targetId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [status, setStatus] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: "" },
  });

  const onSubmit = (values: Values) => {
    const formData = new FormData();
    formData.set("type", type);
    formData.set("targetId", targetId);
    formData.set("reason", values.reason);
    setStatus(null);
    startTransition(async () => {
      const res = await createReportAction(formData);
      if (res?.error) {
        setStatus(res.error);
        return;
      }
      setStatus("Report submitted. Thanks for helping.");
      form.reset();
      setOpen(false);
    });
  };

  // Only render the button if the component is uncontrolled (no open/onOpenChange props)
  const isControlled = controlledOpen !== undefined || onOpenChange !== undefined;

  return (
    <>
      {!isControlled && (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Report
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this {type}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor={`reason-${targetId}`} className="text-sm font-medium text-neutral-900">
                Reason
              </Label>
              <Textarea 
                id={`reason-${targetId}`} 
                {...form.register("reason")}
                className="min-h-[120px] resize-none rounded-lg border-[#e5e7eb]  focus:border-[#7755FF] focus:ring-1 focus:ring-[#7755FF]"
                placeholder="Please describe why you're reporting this..."
              />
              {form.formState.errors.reason ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.reason.message}
                </p>
              ) : null}
            </div>
            {status && (
              <p className={cn(
                "text-sm",
                status.includes("error") || status.includes("Error") 
                  ? "text-red-600" 
                  : "text-emerald-700"
              )}>
                {status}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 rounded-full"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="default" 
                className="flex-1 rounded-full bg-[#7755FF] text-white hover:bg-[#7755FF]/90" 
                disabled={isPending}
              >
                {isPending ? "Submitting..." : "Submit report"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}


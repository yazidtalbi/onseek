"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitFeedbackAction, FeedbackType } from "@/actions/feedback.actions";
import { MessageSquare, Bug, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("feedback");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    startTransition(async () => {
      const result = await submitFeedbackAction({
        type,
        title,
        description,
      });

      if (result.success) {
        setIsSubmitted(true);
        // Reset form after a delay or when closed
        setTimeout(() => {
          if (!open) {
            resetForm();
          }
        }, 1000);
      }
    });
  };

  const resetForm = () => {
    setType("feedback");
    setTitle("");
    setDescription("");
    setIsSubmitted(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Small delay to allow exit animation
      setTimeout(resetForm, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              <DialogHeader className="mb-8">
                <div>
                  <DialogTitle className="text-3xl font-bold tracking-tighter">Help us improve</DialogTitle>
                  <DialogDescription className="text-base mt-2">
                    Found a bug or have a suggestion? We'd love to hear it.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setType("feedback")}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                        type === "feedback"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-100 bg-white text-muted-foreground hover:border-gray-200"
                      )}
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="font-semibold text-sm">Feedback</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("bug")}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                        type === "bug"
                          ? "border-red-500 bg-red-50/50 text-red-600"
                          : "border-gray-100 bg-white text-muted-foreground hover:border-gray-200"
                      )}
                    >
                      <Bug className="w-6 h-6" />
                      <span className="font-semibold text-sm">Bug Report</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    id="title"
                    placeholder={type === "bug" ? "Title: Briefly describe the issue" : "Title: What tool or feature is this about?"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 px-4 rounded-xl border-gray-200 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Textarea
                    id="description"
                    placeholder={type === "bug" ? "Details: What happened? How can we reproduce it?" : "Details: Describe your idea or feedback..."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] p-4 rounded-xl border-gray-200 focus:ring-primary focus:border-primary transition-all resize-none"
                    required
                  />
                </div>

                <DialogFooter className="pt-2 sm:space-x-0">
                  <Button
                    type="submit"
                    disabled={isPending || !title || !description}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg transition-all active:scale-[0.98]"
                  >
                    {isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Send Report"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="p-12 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold tracking-tighter">Thank you!</h3>
                <p className="text-muted-foreground text-lg px-4">
                  We've received your {type}. Your input is invaluable in making onseek better for everyone.
                </p>
              </div>
              <Button
                onClick={() => handleOpenChange(false)}
                variant="outline"
                className="h-12 px-8 rounded-full border-gray-200 hover:bg-gray-50 transition-all font-semibold"
              >
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createConversationAction } from "@/actions/messaging.actions";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";

interface MessageProposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestTitle: string;
  proposerId: string;
  proposerName: string;
}

export function MessageProposerDialog({
  open,
  onOpenChange,
  requestId,
  requestTitle,
  proposerId,
  proposerName,
}: MessageProposerDialogProps) {
  const [content, setContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const result = await createConversationAction(requestId, proposerId, content.trim());

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      onOpenChange(false);
      setContent("");
      setIsSubmitting(false);
      router.push(`/messages`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#7755FF]" />
              Message {proposerName}
            </DialogTitle>
            <p className="text-xs text-neutral-500 mt-1">
              Start a conversation regarding: <span className="font-medium text-neutral-700">{requestTitle}</span>
            </p>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Hi! I'm interested in your proposal. Can we discuss..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-[#7755FF] hover:bg-[#7755FF]/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

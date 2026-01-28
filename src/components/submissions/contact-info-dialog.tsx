"use client";

import * as React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, User, ExternalLink, Phone, Send, ZoomIn, MessageCircle } from "lucide-react";
import Image from "next/image";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ImagePreviewDialog } from "@/components/ui/image-preview-dialog";

interface ContactInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitterProfile: Profile | null;
  imageUrl: string | null;
  itemName: string;
  description?: string | null;
  price?: number | null;
}

export function ContactInfoDialog({
  open,
  onOpenChange,
  submitterProfile,
  imageUrl,
  itemName,
  description,
  price,
}: ContactInfoDialogProps) {
  const [previewOpen, setPreviewOpen] = React.useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Item Information */}
            <div className="border border-[#e5e7eb] rounded-lg p-4">
              <div className="flex gap-3 sm:gap-4">
                {/* Item Image */}
                {imageUrl && (
                  <div className="flex-shrink-0">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border border-[#e5e7eb] bg-neutral-100 group cursor-pointer">
                      <Image
                        src={imageUrl}
                        alt={itemName}
                        fill
                        className="object-cover"
                        unoptimized
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewOpen(true);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Item Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 text-sm sm:text-base line-clamp-2">{itemName}</h3>
                      {description && (
                        <p className="text-sm text-neutral-600 line-clamp-2 mt-1">{description}</p>
                      )}
                    </div>
                    {price && (
                      <div className="flex-shrink-0 text-right">
                        <span className="font-semibold text-neutral-900 text-base sm:text-lg">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {submitterProfile && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900 mb-2">Seller Contact</h3>
              
              {/* Username with Profile Link */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500">Username</p>
                  <Link
                    href={`/app/profile/${submitterProfile.username}`}
                    className="text-sm font-medium text-[#7755FF] hover:underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{submitterProfile.username}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Contact Methods */}
              {submitterProfile.contact_email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">Email</p>
                    <a
                      href={`mailto:${submitterProfile.contact_email}`}
                      className="text-sm font-medium text-neutral-900 hover:text-[#7755FF] break-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {submitterProfile.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {submitterProfile.contact_phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">Phone</p>
                    <a
                      href={`tel:${submitterProfile.contact_phone}`}
                      className="text-sm font-medium text-neutral-900 hover:text-[#7755FF]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {submitterProfile.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {submitterProfile.contact_whatsapp && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">WhatsApp</p>
                    <a
                      href={`https://wa.me/${submitterProfile.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-neutral-900 hover:text-[#7755FF]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {submitterProfile.contact_whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {submitterProfile.contact_telegram && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Send className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-500">Telegram</p>
                    <a
                      href={`https://t.me/${submitterProfile.contact_telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-neutral-900 hover:text-[#7755FF]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {submitterProfile.contact_telegram}
                    </a>
                  </div>
                </div>
              )}

              {/* No contact info message */}
              {!submitterProfile.contact_email && 
               !submitterProfile.contact_phone && 
               !submitterProfile.contact_whatsapp && 
               !submitterProfile.contact_telegram && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                  <p className="text-xs text-gray-600">
                    This seller hasn't added contact information yet. Visit their profile to learn more.
                  </p>
                </div>
              )}
            </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Preview */}
      {imageUrl && (
        <ImagePreviewDialog
          imageUrl={imageUrl}
          alt={itemName}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  );
}


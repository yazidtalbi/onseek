"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from "lucide-react";
import Image from "next/image";
import { updateProfileAction } from "@/actions/profile.actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  profile: any;
}

export function AvatarUpload({ profile }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload avatar");
      }

      const { url } = await response.json();

      // Update profile with new avatar URL
      const profileFormData = new FormData();
      profileFormData.set("username", profile.username);
      profileFormData.set("bio", profile.bio || "");
      profileFormData.set("country", profile.country || "");
      profileFormData.set("avatarUrl", url);

      const result = await updateProfileAction(profileFormData);

      if (result?.error) {
        throw new Error(result.error);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden border-2 border-[#e5e7eb] transition-all group-hover:border-[#7755FF] relative">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-bold text-3xl text-gray-400 bg-gray-50">
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-full px-4 text-xs font-semibold border-gray-200 hover:border-[#7755FF] hover:text-[#7755FF] transition-all h-8"
        >
          {isUploading ? "Uploading..." : "Change avatar"}
        </Button>
        {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
      </div>
    </div>
  );
}

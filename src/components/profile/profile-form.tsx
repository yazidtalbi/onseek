"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { profileSchema } from "@/lib/validators";
import type { Profile } from "@/lib/types";
import { updateProfileAction } from "@/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Values = z.infer<typeof profileSchema>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      bio: profile.bio || "",
    },
  });

  const onSubmit = (values: Values) => {
    const formData = new FormData();
    formData.set("username", values.username);
    formData.set("first_name", values.first_name || "");
    formData.set("last_name", values.last_name || "");
    formData.set("bio", values.bio || "");
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res?.error) {
        setError(res.error);
        setStatus(null);
      } else {
        setError(null);
        setStatus("Profile updated.");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" {...form.register("first_name")} placeholder="e.g. John" />
          {form.formState.errors.first_name ? (
            <p className="text-xs text-red-600">
              {form.formState.errors.first_name.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" {...form.register("last_name")} placeholder="e.g. Doe" />
          {form.formState.errors.last_name ? (
            <p className="text-xs text-red-600">
              {form.formState.errors.last_name.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...form.register("username")} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
        {form.formState.errors.username ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.username.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" {...form.register("bio")} />
        {form.formState.errors.bio ? (
          <p className="text-xs text-red-600">
            {form.formState.errors.bio.message}
          </p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      <Button type="submit" className="w-full bg-[#7755FF] text-white hover:bg-[#6644EE] border-0" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}


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
      bio: profile.bio || "",
    },
  });

  const onSubmit = (values: Values) => {
    const formData = new FormData();
    formData.set("username", values.username);
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
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" {...form.register("username")} />
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
      <Button type="submit" variant="outline" className="w-full bg-gray-100 text-neutral-900 hover:bg-gray-200 border-gray-300" disabled={isPending}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}


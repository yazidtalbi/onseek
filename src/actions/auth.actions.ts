"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validators";

export async function signInAction(formData: FormData) {
  const payload = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  };

  const parsed = signInSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { error: error.message };
    }

    if (!data.session) {
      return { error: "Failed to create session." };
    }

    // Redirect throws - this is expected behavior
    redirect("/");
  } catch (error) {
    // Re-throw redirect errors
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return { error: "An unexpected error occurred during sign in." };
  }
}

export async function signUpAction(formData: FormData) {
  const payload = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    username: String(formData.get("username") || ""),
  };

  const parsed = signUpSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Please check your signup details." };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username: parsed.data.username,
      });
    }

    redirect("/");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    return { error: "An unexpected error occurred during sign up." };
  }
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPasswordAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/app");
}

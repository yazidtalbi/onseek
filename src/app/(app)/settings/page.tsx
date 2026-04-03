import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SettingsContent } from "@/components/settings/settings-content";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  return <SettingsContent user={user} profile={profile} />;
}


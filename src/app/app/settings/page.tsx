import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth.actions";

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

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-white/80 p-6">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Update your public profile and account details.
        </p>
      </div>
      <Card className="border-border bg-white/80">
        <CardContent className="p-6">
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
      <Card className="border-border bg-white/80">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Account</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import { ContactInfoForm } from "@/components/profile/contact-info-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { CategoryPreferences } from "@/components/settings/category-preferences";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth.actions";
import { Settings, User, Mail, Lock, Trash2, Palette, Phone, Sparkles } from "lucide-react";

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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and account settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </h2>
              <p className="text-sm text-muted-foreground">
                Update your public profile information.
              </p>
            </div>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Add your contact details for personal item sales. Only visible to request owners.
              </p>
            </div>
            <ContactInfoForm profile={profile} />
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your account email and authentication.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Email Address</label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm">
                  Change Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests Section */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-6">
            <CategoryPreferences />
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </h2>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of the app.
              </p>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your password and account security.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Section */}
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Sign Out</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sign out of your account on this device.
                </p>
              </div>
              <form action={signOutAction}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account Section */}
        <Card className="border-border bg-card border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold flex items-center gap-2 text-red-600">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


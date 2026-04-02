import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/layout/app-navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { AuthProvider } from "@/components/layout/auth-provider";
import { OnboardingModal } from "@/components/auth/onboarding-modal";


import { PageLayout } from "@/components/layout/page-layout";
import { AppSidebar, SidebarProvider } from "@/components/layout/app-sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Allow guests - no redirect
  let resolvedProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    resolvedProfile = profile;

    // Background sync for missing avatars (for users created before trigger fix)
    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (resolvedProfile && !resolvedProfile.avatar_url && googleAvatar) {
      let sanitizedAvatar = googleAvatar.trim();
      if (sanitizedAvatar.startsWith("//")) sanitizedAvatar = `https:${sanitizedAvatar}`;

      const { data: updatedProfile } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: resolvedProfile.username,
          avatar_url: sanitizedAvatar,
        })
        .select("*")
        .single();

      if (updatedProfile) resolvedProfile = updatedProfile;
    }

    // In the rare case profile is still missing (e.g. manual bypass of callback), 
    // provide a minimal fallback to avoid crashes
    if (!resolvedProfile) {
      resolvedProfile = {
        id: user.id,
        username: user.email?.split("@")[0] || "user",
        reputation: 0,
        onboarding_completed: false
      } as any;
    }
  }

  // Serialize user object to ensure it's properly serializable for client component
  // This prevents chunk loading errors by ensuring only serializable data is passed
  const serializedUser = user
    ? {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
      aud: user.aud,
      created_at: user.created_at,
    }
    : null;

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-0 overflow-x-clip">
        <AppNavbar />
        <div className="flex-1 flex min-h-0 w-full relative">
          <AppSidebar>
            <main className="flex-1 w-full flex flex-col min-w-0">
              {modal}
              <PageLayout>{children}</PageLayout>
            </main>
          </AppSidebar>
        </div>
        <BottomNav />
        <ScrollToTop />
      </div>
    </SidebarProvider>
  );
}

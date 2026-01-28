import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { AuthProvider } from "@/components/layout/auth-provider";
import { MaxWidthWrapper } from "@/components/layout/max-width-wrapper";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
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
    if (!resolvedProfile) {
      await supabase.from("profiles").upsert({
        id: user.id,
        username: user.email?.split("@")[0] || `user-${user.id.slice(0, 6)}`,
      });
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      resolvedProfile = data ?? null;
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
    <AuthProvider user={serializedUser} profile={resolvedProfile ?? null}>
      <div className="flex flex-col min-h-screen bg-background md:pb-24">
        <AppNavbar />
        <main className="flex-1 w-full px-6 pt-8 pb-8 md:px-8 md:pt-8">
          <MaxWidthWrapper>{children}</MaxWidthWrapper>
        </main>
        <MaxWidthWrapper>
          <AppFooter />
        </MaxWidthWrapper>
        <div className="hidden md:block">
          <BottomNav />
        </div>
        <ScrollToTop />
      </div>
    </AuthProvider>
  );
}


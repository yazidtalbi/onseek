import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppFooter } from "@/components/layout/app-footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/components/layout/auth-provider";

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
        display_name: user.user_metadata?.full_name || "Onseek member",
      });
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      resolvedProfile = data ?? null;
    }
  }

  return (
    <AuthProvider user={user ?? null} profile={resolvedProfile ?? null}>
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <AppNavbar />
        <main className="flex-1 w-full px-4 py-6 md:px-6">
          <div className="mx-auto max-w-7xl w-full">{children}</div>
        </main>
        <div className="mx-auto max-w-7xl w-full">
          <AppFooter />
        </div>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}


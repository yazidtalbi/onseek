import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/layout/auth-provider";
import { AppNavbar } from "@/components/layout/app-navbar";
import { AppSidebar, SidebarProvider } from "@/components/layout/app-sidebar";

export const dynamic = "force-dynamic";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <SidebarProvider>
        <div className="flex flex-col min-h-screen bg-white">
          <AppNavbar />
          <div className="flex-1 flex w-full relative">
            <AppSidebar>
              <main className="flex-1 w-full h-full">
                {children}
              </main>
            </AppSidebar>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}

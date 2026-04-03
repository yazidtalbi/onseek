import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirect URL after auth
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!sessionError && user) {
      // Sync profile/avatar in the callback
      try {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        let googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        if (googleAvatar && typeof googleAvatar === "string") {
          googleAvatar = googleAvatar.trim();
          if (googleAvatar.startsWith("//")) {
            googleAvatar = `https:${googleAvatar}`;
          }
        }
        
        if (!existingProfile || (!existingProfile.avatar_url && googleAvatar)) {
          const baseUsername = existingProfile?.username || user.email?.split("@")[0] || `user-${user.id.slice(0, 6)}`;
          
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: user.id,
              username: baseUsername,
              avatar_url: googleAvatar,
              // don't overwrite onboarding_completed if it's already true
              onboarding_completed: existingProfile?.onboarding_completed || false,
            });

          if (upsertError && !existingProfile) {
            // Try with random suffix if collision
            const randomSuffix = Math.floor(Math.random() * 10000);
            await supabase
              .from("profiles")
              .upsert({
                id: user.id,
                username: `${baseUsername}-${randomSuffix}`,
                avatar_url: googleAvatar,
              });
          }
        }
      } catch (err) {
        console.error("Callback profile sync failed:", err);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}

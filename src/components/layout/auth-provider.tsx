"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

// Serialized user type for passing from server to client
type SerializedUser = Pick<User, "id" | "email" | "user_metadata" | "app_metadata" | "aud" | "created_at"> | null;

type AuthContextValue = {
  user: SerializedUser;
  profile: Profile | null;
};

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  profile: null,
});

export function AuthProvider({
  user,
  profile,
  children,
}: {
  user: SerializedUser;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Refresh to sync cookies on significant auth changes
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const value = React.useMemo(() => ({ user, profile }), [user, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

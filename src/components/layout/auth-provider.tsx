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
  const [isRedirecting, setIsRedirecting] = React.useState(() => {
    return typeof window !== "undefined" && window.location.hash.includes("access_token");
  });

  React.useEffect(() => {
    // Detect if we are in an OAuth redirect fragment
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      setIsRedirecting(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // If we signed in (or token refreshed), refresh the page to sync cookies
      if (event === "SIGNED_IN") {
        setIsRedirecting(false);
        router.refresh();
      }
      
      // Also handles session clearing
      if (event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const value = React.useMemo(() => ({ user, profile }), [user, profile]);

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#7755FF] animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-expanded)' }}>
          Finalizing your login...
        </h2>
        <p className="text-sm text-gray-500">
          Almost there! We're setting up your secure session.
        </p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}


"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
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
  user: User | null;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ user, profile }), [user, profile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}


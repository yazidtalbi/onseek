"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

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
  const value = React.useMemo(() => ({ user, profile }), [user, profile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}


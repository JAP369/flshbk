"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import type { Profile } from "@/lib/types/database";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  clerkUserId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  clerkUserId: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();

  const profile: Profile | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        username: clerkUser.username || clerkUser.id.slice(0, 8),
        display_name: clerkUser.fullName || clerkUser.username || "User",
        avatar_url: clerkUser.imageUrl,
        bio: null,
        level: 1,
        xp: 0,
        nexus_tokens: 0,
        verified_trades: 0,
        is_verified: false,
        streak_count: 0,
        last_active: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: profile,
        loading: !isLoaded,
        isAuthenticated: !!clerkUser,
        clerkUserId: clerkUser?.id ?? null,
        signOut: clerkSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { Profile } from "@/lib/types/database";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  clerkUserId: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  clerkUserId: null,
  signOut: async () => {},
  refreshUser: () => {},
});

function isClerkConfigured(): boolean {
  if (typeof window === "undefined") return true;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  return !!(
    publishableKey &&
    secretKey &&
    !publishableKey.includes("placeholder") &&
    !secretKey.includes("placeholder") &&
    publishableKey.startsWith("pk_") &&
    secretKey.startsWith("sk_")
  );
}

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function getDevUser(): Profile | null {
  const auth = getCookie("dev_auth");
  if (!auth) return null;

  const raw = getCookie("dev_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clerkConfigured = isClerkConfigured();
  const [devUser, setDevUser] = useState<Profile | null>(null);
  const [devLoading, setDevLoading] = useState(true);

  const refreshDevUser = useCallback(() => {
    if (!clerkConfigured) {
      const user = getDevUser();
      setDevUser(user);
      setDevLoading(false);
    }
  }, [clerkConfigured]);

  useEffect(() => {
    refreshDevUser();
  }, [refreshDevUser]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    if (clerkConfigured) return;
    window.addEventListener("storage", refreshDevUser);
    return () => window.removeEventListener("storage", refreshDevUser);
  }, [clerkConfigured, refreshDevUser]);

  if (clerkConfigured) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          loading: false,
          isAuthenticated: false,
          clerkUserId: null,
          signOut: async () => {},
          refreshUser: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const handleDevSignOut = async () => {
    await fetch("/api/dev-login", { method: "DELETE" });
    setDevUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user: devUser,
        loading: devLoading,
        isAuthenticated: !!devUser,
        clerkUserId: devUser?.id ?? null,
        signOut: handleDevSignOut,
        refreshUser: refreshDevUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

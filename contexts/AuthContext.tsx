"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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

// Check if Clerk is properly configured
function isClerkConfigured(): boolean {
  if (typeof window === "undefined") return true; // SSR default to Clerk
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

// Read dev user from cookie
function getDevUser(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const cookies = document.cookie.split(";");
    const sessionCookie = cookies.find((c) =>
      c.trim().startsWith("dev_session="),
    );
    const userCookie = cookies.find((c) => c.trim().startsWith("dev_user="));

    if (sessionCookie && userCookie) {
      const userData = decodeURIComponent(userCookie.split("=")[1]);
      return JSON.parse(userData) as Profile;
    }
  } catch {
    // ignore
  }
  return null;
}

function clearDevCookies() {
  document.cookie =
    "dev_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "dev_user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const clerkConfigured = isClerkConfigured();
  const [devUser, setDevUser] = useState<Profile | null>(null);
  const [devLoading, setDevLoading] = useState(true);

  // Dev mode: read user from cookies
  useEffect(() => {
    if (!clerkConfigured) {
      const user = getDevUser();
      setDevUser(user);
      setDevLoading(false);
    }
  }, [clerkConfigured]);

  // If Clerk is configured, render children (ClerkProvider handles auth in layout)
  if (clerkConfigured) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          loading: false,
          isAuthenticated: false,
          clerkUserId: null,
          signOut: async () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  // Dev mode: use cookie-based auth
  const handleDevSignOut = async () => {
    clearDevCookies();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

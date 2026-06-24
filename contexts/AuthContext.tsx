"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  nexusTokens: number;
  verifiedTrades: number;
  isVerified: boolean;
  xp: number;
  streakCount: number;
  bio: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_active: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  refreshUser: () => void;
  clerkUserId: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  signIn: () => {},
  signOut: () => {},
  refreshUser: () => {},
  clerkUserId: null,
});

export const DEV_USERS: AuthUser[] = [
  {
    id: "dev-001",
    username: "jap369",
    displayName: "JAP369",
    avatar: "J",
    level: 36,
    nexusTokens: 12840,
    verifiedTrades: 142,
    isVerified: true,
    xp: 24600,
    streakCount: 28,
    bio: "Collector & developer. Building FLSHBK.",
    email: "jap369@flshbk.local",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("flshbk_user");
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          setUser(parsed);
        }
      } catch {
        // ignore parse errors
      }
      setLoading(false);
    }
  }, []);

  const login = (u: AuthUser) => {
    setUser(u);
    setLoading(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("flshbk_user", JSON.stringify(u));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("flshbk_user");
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        logout,
        signIn: login,
        signOut: logout,
        refreshUser: () => {},
        clerkUserId: user?.id ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

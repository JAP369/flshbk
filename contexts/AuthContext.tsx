"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
    username: "vault_rex",
    displayName: "Vault Rex",
    avatar: "🦁",
    level: 7,
    nexusTokens: 2840,
    verifiedTrades: 14,
    isVerified: true,
    xp: 3250,
    streakCount: 5,
    bio: "OG collector. Labubu hunter.",
    email: "vault@flshbk.local",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  },
  {
    id: "dev-002",
    username: "chase_queen",
    displayName: "Chase Queen",
    avatar: "👑",
    level: 12,
    nexusTokens: 8200,
    verifiedTrades: 31,
    isVerified: true,
    xp: 8400,
    streakCount: 12,
    bio: "Chase hunter. PSA 10 everything.",
    email: "chase@flshbk.local",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  },
  {
    id: "dev-003",
    username: "newbie_collector",
    displayName: "Newbie",
    avatar: "🐣",
    level: 1,
    nexusTokens: 40,
    verifiedTrades: 0,
    isVerified: false,
    xp: 0,
    streakCount: 0,
    bio: "Just starting out!",
    email: "newbie@flshbk.local",
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (u: AuthUser) => {
    setUser(u);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
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

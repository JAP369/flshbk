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
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
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
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login: setUser,
        logout: () => setUser(null),
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

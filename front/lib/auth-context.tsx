"use client";

import { setCsrfToken } from "@lib/api";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Call after a successful login to populate the user + CSRF token. */
  setAuth: (user: AuthUser, csrfToken: string) => void;
  /** Call after logout. */
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the current user + CSRF token in memory (never the session cookie — the
 * browser manages that). Hydrates once on mount from /api/auth/me.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (res) => {
        if (!active || !res.ok) return;
        const data = (await res.json()) as { user: AuthUser; csrfToken: string };
        setUser(data.user);
        setCsrfToken(data.csrfToken ?? null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function setAuth(nextUser: AuthUser, csrfToken: string) {
    setUser(nextUser);
    setCsrfToken(csrfToken);
  }

  function clearAuth() {
    setUser(null);
    setCsrfToken(null);
  }

  return <AuthContext.Provider value={{ user, loading, setAuth, clearAuth }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

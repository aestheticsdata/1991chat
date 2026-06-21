"use client";

import { authService } from "@services/auth.service";
import type { AuthUser } from "@services/auth.types";
import { setCsrfToken } from "@services/http/csrf";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type { AuthUser };

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
    const controller = new AbortController();
    async function hydrate() {
      try {
        const session = await authService.me(controller.signal);
        if (!controller.signal.aborted && session) {
          setUser(session.user);
          setCsrfToken(session.csrfToken);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    hydrate();
    return () => controller.abort();
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

"use client";

import type { AuthSession } from "@services/auth.types";
import * as http from "@services/http/client";

/**
 * Auth/session calls against the BFF. `login`/`register`/`me` opt out of the
 * 401 → /login redirect: for them a 401 just means "not signed in", which the
 * caller handles, rather than "session expired mid-use".
 */
export const authService = {
  login: (username: string, password: string): Promise<AuthSession> =>
    http.post<AuthSession>("/auth/login", { username, password }, { skipAuthRedirect: true }),

  register: (username: string, password: string): Promise<AuthSession> =>
    http.post<AuthSession>("/auth/register", { username, password }, { skipAuthRedirect: true }),

  /** Resolves to the active session, or `null` when there's no session (or it can't load). */
  async me(signal?: AbortSignal): Promise<AuthSession | null> {
    try {
      return await http.get<AuthSession>("/auth/me", { skipAuthRedirect: true, signal });
    } catch {
      return null;
    }
  },

  logout: (): Promise<void> => http.post<void>("/auth/logout"),

  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    http.post<void>("/auth/change-password", { currentPassword, newPassword }),
};

"use client";

/**
 * The CSRF token, cached in memory and shared by every HTTP path (the JSON
 * client and the chat SSE stream). Set by AuthProvider on login / hydration;
 * read here to attach the `x-csrf-token` header on unsafe requests. Never
 * persisted — the browser owns the session cookie.
 */
let csrfToken: string | null = null;

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

/** Unsafe = state-mutating, so the request must carry the CSRF header. */
export function isUnsafe(method: string): boolean {
  const m = method.toUpperCase();
  return m !== "GET" && m !== "HEAD";
}

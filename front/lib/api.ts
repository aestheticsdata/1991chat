"use client";

// CSRF token cached in memory. Set by AuthProvider on login /
// hydration; read here to attach the x-csrf-token header on unsafe requests.
let csrfToken: string | null = null;
export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

const isUnsafe = (method: string) => method !== "GET" && method !== "HEAD";

/**
 * Client-side fetch to the BFF (`/api/*`). The browser sends the session cookie
 * automatically (same-origin); this injects the CSRF header on unsafe methods
 * and, on a 403, refreshes the token once and retries. Returns the raw Response
 * so callers can read JSON or stream SSE via `res.body`.
 *
 * Use this from your chat components, e.g.:
 *   const res = await apiFetch('/chat', { method: 'POST',
 *     body: JSON.stringify({ conversationId, content }) });
 *   const reader = res.body!.getReader(); // read the SSE stream
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();

  const buildHeaders = (token: string | null): Headers => {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    if (isUnsafe(method) && token) headers.set("x-csrf-token", token);
    return headers;
  };

  let res = await fetch(`/api${path}`, {
    ...init,
    method,
    headers: buildHeaders(csrfToken),
    credentials: "same-origin",
  });

  if (res.status === 403 && isUnsafe(method)) {
    const refreshed = await fetch("/api/auth/csrf", { credentials: "same-origin" });
    if (refreshed.ok) {
      const { csrfToken: fresh } = (await refreshed.json()) as { csrfToken: string };
      setCsrfToken(fresh);
      res = await fetch(`/api${path}`, {
        ...init,
        method,
        headers: buildHeaders(fresh),
        credentials: "same-origin",
      });
    }
  }

  // Session missing/expired → bounce to login (covers idle tabs, not just the
  // full-page navigations the server-side gate already handles).
  if (res.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
    setCsrfToken(null);
    window.location.replace("/login");
  }

  return res;
}

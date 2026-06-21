"use client";

import { getCsrfToken, isUnsafe, setCsrfToken } from "@services/http/csrf";
import { parseError } from "@services/http/errors";

const BASE_URL = "/api";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** A plain object is JSON-serialized; strings / FormData / etc. pass through. */
  body?: unknown;
  /**
   * Skip the automatic 401 → /login redirect. Used by the auth-bootstrap calls
   * (login, register, me) where a 401 means "not signed in", not "session expired".
   */
  skipAuthRedirect?: boolean;
}

type RawInit = RequestInit & { skipAuthRedirect?: boolean };

/**
 * Low-level fetch to the BFF (`/api/*`). The browser sends the session cookie
 * automatically; this injects the CSRF header on unsafe methods, refreshes the
 * token once on a 403 and retries, and bounces to /login on a 401. Returns the
 * raw `Response` so callers can read JSON (`request`) or stream SSE (chat).
 */
export async function rawFetch(path: string, init: RawInit = {}): Promise<Response> {
  const { skipAuthRedirect, ...requestInit } = init;
  const method = (requestInit.method ?? "GET").toUpperCase();

  const run = (token: string | null): Promise<Response> => {
    const headers = new Headers(requestInit.headers);
    if (requestInit.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    if (isUnsafe(method) && token) headers.set("x-csrf-token", token);
    return fetch(`${BASE_URL}${path}`, { ...requestInit, method, headers, credentials: "same-origin" });
  };

  let res = await run(getCsrfToken());

  // Stale / rotated CSRF token → refresh once and retry the unsafe request.
  if (res.status === 403 && isUnsafe(method)) {
    const refreshed = await fetch(`${BASE_URL}/auth/csrf`, { credentials: "same-origin" });
    if (refreshed.ok) {
      const { csrfToken } = (await refreshed.json()) as { csrfToken: string };
      setCsrfToken(csrfToken);
      res = await run(csrfToken);
    }
  }

  // Session missing/expired → bounce to login (covers idle tabs the server gate misses).
  if (
    res.status === 401 &&
    !skipAuthRedirect &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/login"
  ) {
    setCsrfToken(null);
    window.location.replace("/login");
  }

  return res;
}

/**
 * Typed JSON request: serializes the body, throws `ApiError` on any non-2xx, and
 * parses the JSON response (`undefined` for an empty / 204 body).
 */
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, skipAuthRedirect, ...rest } = opts;
  const init: RawInit = { ...rest, skipAuthRedirect };
  if (body !== undefined) {
    init.body = typeof body === "string" || body instanceof FormData ? body : JSON.stringify(body);
  }

  const res = await rawFetch(path, init);
  if (!res.ok) throw await parseError(res);

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const get = <T>(path: string, opts?: RequestOptions): Promise<T> => request<T>(path, { ...opts, method: "GET" });

export const post = <T>(path: string, body?: unknown, opts?: RequestOptions): Promise<T> =>
  request<T>(path, { ...opts, method: "POST", body });

export const del = <T>(path: string, opts?: RequestOptions): Promise<T> =>
  request<T>(path, { ...opts, method: "DELETE" });

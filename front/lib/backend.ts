import { NextRequest } from "next/server";

/** The NestJS backend the BFF proxies to. Server-side only. */
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:6400";

const FORWARD_REQUEST_HEADERS = ["cookie", "content-type", "x-csrf-token", "x-mock-scenario"];
const RELAY_RESPONSE_HEADERS = ["content-type", "cache-control"];

/**
 * Transparent pass-through proxy: browser → this BFF → NestJS. Forwards the
 * session cookie + CSRF header to the backend and relays the backend response
 * (status, streamed body, and Set-Cookie) straight back to the browser. The
 * backend owns the session cookie; the BFF just carries it across the origin
 * boundary and keeps the backend off the public network.
 */
export async function proxy(req: NextRequest, backendPath: string, methodOverride?: string): Promise<Response> {
  const method = methodOverride ?? req.method;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Tell the backend the original scheme (so Secure session cookies work in prod).
  headers.set("x-forwarded-proto", req.nextUrl.protocol.replace(":", ""));

  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  const backendRes = await fetch(`${BACKEND_URL}${backendPath}`, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const name of RELAY_RESPONSE_HEADERS) {
    const value = backendRes.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  // Relay every Set-Cookie so the backend-issued session cookie reaches the browser.
  for (const cookie of backendRes.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(backendRes.body, { status: backendRes.status, headers: responseHeaders });
}

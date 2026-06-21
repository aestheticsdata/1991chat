/**
 * Normalized HTTP error. Services throw this on any non-2xx response so callers
 * catch one predictable shape instead of inspecting `Response`/status codes. A
 * thin `Error` subclass: it rides the native throw/catch channel (real stack
 * trace, `instanceof`) while carrying the backend's status and message.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Present when the backend returns `message: string[]` (e.g. validation). */
  readonly details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    // Keep `instanceof ApiError` working once transpiled (Error-subclass caveat).
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Build an `ApiError` from a non-OK `Response`, reading NestJS's
 * `{ message: string | string[] }` body and falling back to the status text.
 */
export async function parseError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as { message?: unknown } | null;
  const raw = body?.message;
  const details = Array.isArray(raw) ? raw.filter((m): m is string => typeof m === "string") : undefined;
  const first = Array.isArray(raw) ? details?.[0] : typeof raw === "string" ? raw : undefined;
  const message = first || res.statusText || `Request failed with status ${res.status}`;
  return new ApiError(message, res.status, details && details.length > 0 ? details : undefined);
}

import { randomBytes } from 'node:crypto';

/** A fresh CSRF token (stored in the session, echoed in the x-csrf-token header). */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

import 'express-session';

// What we keep in each server-side session (stored in Redis, keyed by the
// opaque sid in the httpOnly cookie).
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
    csrfToken?: string;
  }
}

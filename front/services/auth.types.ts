/**
 * Auth / session DTOs — the serialized shapes the BFF returns.
 */

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthSession {
  user: AuthUser;
  csrfToken: string;
}

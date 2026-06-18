import { cookies } from 'next/headers';
import { BACKEND_URL } from '@lib/backend';

export interface ServerUser {
  id: string;
  username: string;
}

/**
 * Server-side session check (used to gate pages):
 * forward the incoming cookies to the backend's /auth/me and return the user,
 * or null if there's no valid session.
 */
export async function getServerUser(): Promise<ServerUser | null> {
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  if (!cookieHeader) return null;

  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });
  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as { user?: ServerUser } | null;
  return data?.user ?? null;
}

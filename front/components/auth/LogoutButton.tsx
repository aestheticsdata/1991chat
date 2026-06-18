'use client';

import { useRouter } from 'next/navigation';
import { apiFetch } from '@lib/api';
import { useAuth } from '@lib/auth-context';

export function LogoutButton() {
  const router = useRouter();
  const { clearAuth } = useAuth();

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' });
    clearAuth();
    router.replace('/login');
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-xs text-neutral-500 hover:text-neutral-800">
      Sign out
    </button>
  );
}

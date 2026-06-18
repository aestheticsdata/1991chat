'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      const data = (await res.json()) as { user: { id: string; username: string }; csrfToken: string };
      setAuth(data.user, data.csrfToken);
      router.replace('/');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? 'Login failed');
    }
  }

  return (
    <div className="grid h-screen place-items-center bg-neutral-50">
      <form
        onSubmit={onSubmit}
        className="w-80 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs"
      >
        <h1 className="mb-1 text-xl font-semibold">1991chat</h1>
        <p className="mb-5 text-sm text-neutral-500">Sign in to continue</p>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-neutral-600">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-hidden focus:border-neutral-400"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-neutral-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-hidden focus:border-neutral-400"
          />
        </label>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-4 text-center text-xs text-neutral-400">default dev user: admin / admin</p>
      </form>
    </div>
  );
}

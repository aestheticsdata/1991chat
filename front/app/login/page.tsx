"use client";

import { PasswordInput } from "@components/auth/PasswordInput";
import { SiteHeader } from "@components/SiteHeader";
import { text } from "@i18n";
import { useAuth } from "@lib/auth-context";
import { authService } from "@services/auth.service";
import { ApiError } from "@services/http/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user, csrfToken } = await authService.login(username, password);
      setAuth(user, csrfToken);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : text.auth.login.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <div className="grid flex-1 place-items-center p-4">
        <form onSubmit={onSubmit} className="w-80 rounded-2xl border border-line bg-surface p-6 shadow-xs">
          <h1 className="mb-1 font-display text-xl">{text.common.brand}</h1>
          <p className="mb-5 text-sm text-ink-muted">{text.auth.login.title}</p>

          <label htmlFor="username" className="mb-3 block text-sm">
            <span className="mb-1 block text-ink-muted">{text.auth.login.username}</span>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-line bg-elevated px-3 py-2 text-ink outline-hidden focus:border-accent"
            />
          </label>

          <label htmlFor="password" className="mb-4 block text-sm">
            <span className="mb-1 block text-ink-muted">{text.auth.login.password}</span>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2 text-on-accent transition hover:bg-accent-strong disabled:opacity-50"
          >
            {loading ? text.auth.login.submitLoading : text.auth.login.submit}
          </button>

          <p className="mt-4 text-center text-sm text-ink-muted">
            {text.auth.login.noAccount}{" "}
            <Link href="/signup" className="text-ink underline hover:text-ink-muted">
              {text.auth.login.signupCta}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

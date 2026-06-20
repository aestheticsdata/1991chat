"use client";

import { PasswordInput } from "@components/auth/PasswordInput";
import { SiteHeader } from "@components/SiteHeader";
import { text } from "@i18n";
import { useAuth } from "@lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(text.auth.signup.mismatch);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      const data = (await res.json()) as { user: { id: string; username: string }; csrfToken: string };
      setAuth(data.user, data.csrfToken);
      router.replace("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      const message = Array.isArray(data.message) ? data.message[0] : data.message;
      setError(typeof message === "string" ? message : text.auth.signup.error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <div className="grid flex-1 place-items-center p-4">
        <form onSubmit={onSubmit} className="w-80 rounded-2xl border border-line bg-surface p-6 shadow-xs">
          <h1 className="mb-1 text-xl font-semibold">{text.auth.signup.heading}</h1>
          <p className="mb-5 text-sm text-ink-muted">{text.auth.signup.subtitle}</p>

          <label htmlFor="username" className="mb-3 block text-sm">
            <span className="mb-1 block text-ink-muted">{text.auth.signup.username}</span>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-line bg-elevated px-3 py-2 text-ink outline-hidden focus:border-accent"
            />
          </label>

          <label htmlFor="password" className="mb-3 block text-sm">
            <span className="mb-1 block text-ink-muted">{text.auth.signup.password}</span>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          <label htmlFor="confirm-password" className="mb-4 block text-sm">
            <span className="mb-1 block text-ink-muted">{text.auth.signup.confirmPassword}</span>
            <PasswordInput
              id="confirm-password"
              name="confirm-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2 text-on-accent transition hover:bg-accent-strong disabled:opacity-50"
          >
            {loading ? text.auth.signup.submitLoading : text.auth.signup.submit}
          </button>

          <p className="mt-4 text-center text-sm text-ink-muted">
            {text.auth.signup.haveAccount}{" "}
            <Link href="/login" className="text-ink underline hover:text-ink-muted">
              {text.auth.signup.loginCta}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

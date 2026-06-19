"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@components/auth/PasswordInput";
import { SiteHeader } from "@components/SiteHeader";
import { useAuth } from "@lib/auth-context";
import { text } from "@i18n";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
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
      setError(typeof data.message === "string" ? data.message : text.auth.login.error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <SiteHeader />
      <div className="grid flex-1 place-items-center p-4">
        <form onSubmit={onSubmit} className="w-80 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <h1 className="mb-1 font-display text-xl">{text.common.brand}</h1>
          <p className="mb-5 text-sm text-neutral-500">{text.auth.login.title}</p>

          <label htmlFor="username" className="mb-3 block text-sm">
            <span className="mb-1 block text-neutral-600">{text.auth.login.username}</span>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-hidden focus:border-neutral-400"
            />
          </label>

          <label htmlFor="password" className="mb-4 block text-sm">
            <span className="mb-1 block text-neutral-600">{text.auth.login.password}</span>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? text.auth.login.submitLoading : text.auth.login.submit}
          </button>

          <p className="mt-4 text-center text-sm text-neutral-500">
            {text.auth.login.noAccount}{" "}
            <Link href="/signup" className="text-neutral-900 underline hover:text-neutral-700">
              {text.auth.login.signupCta}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

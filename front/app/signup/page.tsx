"use client";

import { PasswordInput } from "@components/auth/PasswordInput";
import { SiteHeader } from "@components/SiteHeader";
import { useAuth } from "@lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
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
      setError(typeof message === "string" ? message : "Sign up failed");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <SiteHeader />
      <div className="grid flex-1 place-items-center p-4">
        <form onSubmit={onSubmit} className="w-80 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
          <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
          <p className="mb-5 text-sm text-neutral-500">Sign up to start chatting</p>

          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-neutral-600">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-hidden focus:border-neutral-400"
            />
          </label>

          <label className="mb-3 block text-sm">
            <span className="mb-1 block text-neutral-600">Password</span>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </label>

          <label className="mb-4 block text-sm">
            <span className="mb-1 block text-neutral-600">Confirm password</span>
            <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </label>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>

          <p className="mt-4 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="text-neutral-900 underline hover:text-neutral-700">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

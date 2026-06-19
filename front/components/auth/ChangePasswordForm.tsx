"use client";

import { PasswordInput } from "@components/auth/PasswordInput";
import { apiFetch } from "@lib/api";
import { type FormEvent, useState } from "react";

/**
 * Change-password form. Identity comes from the session server-side, so the
 * username is shown read-only (for confirmation) and not submitted. "Confirm new
 * password" is a client-only match check. A wrong current password returns 400
 * (handled here); a 401 means the session expired and apiFetch redirects to login.
 */
export function ChangePasswordForm({ username }: { username: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setDone(false);
    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    const res = await apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } else {
      const data = await res.json().catch(() => ({}));
      const message = Array.isArray(data.message) ? data.message[0] : data.message;
      setError(typeof message === "string" ? message : "Could not change password");
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-80 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
      <h1 className="mb-1 text-xl font-semibold">Change password</h1>
      <p className="mb-5 text-sm text-neutral-500">Update the password for your account</p>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-neutral-600">Username</span>
        <input
          value={username}
          readOnly
          autoComplete="username"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-500 outline-hidden"
        />
      </label>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-neutral-600">Current password</span>
        <PasswordInput
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-neutral-600">New password</span>
        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </label>

      <label className="mb-4 block text-sm">
        <span className="mb-1 block text-neutral-600">Confirm new password</span>
        <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </label>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {done && <p className="mb-3 text-sm text-green-600">Password changed.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}

"use client";

import { PasswordInput } from "@components/auth/PasswordInput";
import { text } from "@i18n";
import { authService } from "@services/auth.service";
import { ApiError } from "@services/http/errors";
import type { SubmitEvent } from "react";
import { useState } from "react";

/**
 * Change-password form. Identity comes from the session server-side, so the
 * username is shown read-only (for confirmation) and not submitted. "Confirm new
 * password" is a client-only match check. A wrong current password returns 400
 * (handled here); a 401 means the session expired and the HTTP client redirects to login.
 */
export function ChangePasswordForm({ username }: { username: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDone(false);
    if (newPassword !== confirm) {
      setError(text.auth.changePassword.mismatch);
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : text.auth.changePassword.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-80 rounded-2xl border border-line bg-surface p-6 shadow-xs">
      <h1 className="mb-1 text-xl font-semibold">{text.auth.changePassword.heading}</h1>
      <p className="mb-5 text-sm text-ink-muted">{text.auth.changePassword.subtitle}</p>

      <label htmlFor="username" className="mb-3 block text-sm">
        <span className="mb-1 block text-ink-muted">{text.auth.changePassword.username}</span>
        <input
          id="username"
          name="username"
          value={username}
          readOnly
          autoComplete="username"
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-ink-faint outline-hidden"
        />
      </label>

      <label htmlFor="current-password" className="mb-3 block text-sm">
        <span className="mb-1 block text-ink-muted">{text.auth.changePassword.currentPassword}</span>
        <PasswordInput
          id="current-password"
          name="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>

      <label htmlFor="new-password" className="mb-3 block text-sm">
        <span className="mb-1 block text-ink-muted">{text.auth.changePassword.newPassword}</span>
        <PasswordInput
          id="new-password"
          name="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </label>

      <label htmlFor="confirm-password" className="mb-4 block text-sm">
        <span className="mb-1 block text-ink-muted">{text.auth.changePassword.confirmPassword}</span>
        <PasswordInput
          id="confirm-password"
          name="confirm-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </label>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      {done && <p className="mb-3 text-sm text-green-400">{text.auth.changePassword.success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-2 text-on-accent transition hover:bg-accent-strong disabled:opacity-50"
      >
        {loading ? text.auth.changePassword.submitLoading : text.auth.changePassword.submit}
      </button>
    </form>
  );
}

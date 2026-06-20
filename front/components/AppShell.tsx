"use client";

import { Sidebar } from "@components/Sidebar";
import { SidebarAccountNav } from "@components/SidebarAccountNav";
import { text } from "@i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/**
 * Signed-in shell. Tablet/desktop (md+) keep the persistent sidebar untouched.
 * On mobile the sidebar becomes an off-canvas drawer (80% of the viewport)
 * overlaying the chat + prompt, opened from the top-left button and dismissed by
 * the scrim, a nav, or Escape — so the chat and prompt fill the whole screen.
 *
 *   mobile (closed)            mobile (open)
 *   ┌──────────────┐           ┌───────────┲━━━━┓
 *   │ ☰  1991CHAT  │           │ drawer 80%┃scrim┃
 *   │ chat …       │           │           ┃    ┃
 *   │ prompt …     │           │           ┃    ┃
 *   └──────────────┘           └───────────┺━━━━┛
 */
export function AppShell({ username, children }: { username: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer after navigating (no-op on md+, where it's always shown).
  // pathname is an intentional trigger: the body doesn't read it, but the effect
  // must re-run on each route change to dismiss the drawer.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the open drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Scrim — mobile only, tap to dismiss. */}
      {open && (
        <button
          type="button"
          aria-label={text.shell.closeMenu}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-4/5 shrink-0 flex-col border-r border-line bg-surface transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:translate-x-0 md:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Link href="/" className="font-display text-base text-ink transition hover:text-ink-muted">
            {text.common.brand}
          </Link>
          <button
            type="button"
            aria-label={text.shell.closeMenu}
            onClick={() => setOpen(false)}
            className="-mr-1 grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-elevated hover:text-ink md:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <SidebarAccountNav />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar />
        </div>
        {/* User chip — pinned at the bottom of the sidebar. */}
        <div className="flex shrink-0 items-center gap-2.5 border-t border-line px-3 py-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-elevated text-ink-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="truncate text-sm font-medium text-ink-muted" title={username}>
            {username}
          </span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar — sidebar toggle. Hidden on md+ (persistent sidebar). */}
        <div className="flex shrink-0 items-center gap-2 border-b border-line bg-surface px-3 py-2 md:hidden">
          <button
            type="button"
            aria-label={text.shell.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition hover:bg-elevated hover:text-ink"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
          <Link href="/" className="font-display text-sm text-ink">
            {text.common.brand}
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}

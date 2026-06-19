"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { text } from "@i18n";
import { apiFetch } from "@lib/api";
import { useAuth } from "@lib/auth-context";

const ROW =
  "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900";

function Svg({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </svg>
  );
}

/**
 * Account actions for the chat sidebar — change password, about, sign out, as a
 * tidy menu group. The username itself lives in the user chip at the bottom of
 * the sidebar (see AppShell), not here.
 */
export function SidebarAccountNav() {
  const router = useRouter();
  const { clearAuth } = useAuth();

  async function signOut() {
    await apiFetch("/auth/logout", { method: "POST" });
    clearAuth();
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-neutral-200 p-2 text-sm">
      <Link href="/change-password" className={ROW}>
        <Svg>
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </Svg>
        {text.nav.changePassword}
      </Link>

      <Link href="/about" className={ROW}>
        <Svg>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </Svg>
        {text.nav.about}
      </Link>

      <button type="button" onClick={signOut} className={ROW}>
        <Svg>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </Svg>
        {text.nav.signOut}
      </button>
    </nav>
  );
}

"use client";

import { text } from "@i18n";
import { apiFetch } from "@lib/api";
import { useAuth } from "@lib/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode, SVGProps } from "react";

function Svg(props: SVGProps<SVGSVGElement>) {
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
      {...props}
    />
  );
}

const LoginIcon = () => (
  <Svg>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </Svg>
);
const SignupIcon = () => (
  <Svg>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </Svg>
);
const AboutIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Svg>
);
const ChatIcon = () => (
  <Svg>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);
const KeyIcon = () => (
  <Svg>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </Svg>
);
const LogoutIcon = () => (
  <Svg>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </Svg>
);

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 border-b-2 py-3 text-sm transition ${
        active ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * Top navigation for the auth/public pages (login, signup, change-password,
 * about). Auth-aware: shows the logged-out links until the session hydrates,
 * then the logged-in links. NOT used on the chat shell — that keeps its sidebar.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuth();

  async function signOut() {
    await apiFetch("/auth/logout", { method: "POST" });
    clearAuth();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4">
        {user ? (
          <>
            <NavLink href="/" active={pathname === "/"}>
              <ChatIcon /> {text.nav.chat}
            </NavLink>
            <NavLink href="/change-password" active={pathname === "/change-password"}>
              <KeyIcon /> {text.nav.changePassword}
            </NavLink>
            <NavLink href="/about" active={pathname === "/about"}>
              <AboutIcon /> {text.nav.about}
            </NavLink>
            <button
              type="button"
              onClick={signOut}
              className="ml-auto flex items-center gap-1.5 py-3 text-sm text-ink-muted transition hover:text-ink"
            >
              <LogoutIcon /> {text.nav.signOut}
            </button>
          </>
        ) : (
          <>
            <NavLink href="/login" active={pathname === "/login"}>
              <LoginIcon /> {text.nav.login}
            </NavLink>
            <NavLink href="/signup" active={pathname === "/signup"}>
              <SignupIcon /> {text.nav.signup}
            </NavLink>
            <NavLink href="/about" active={pathname === "/about"}>
              <AboutIcon /> {text.nav.about}
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

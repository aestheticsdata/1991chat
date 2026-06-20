"use client";

import { CloseIcon } from "@components/shell/icons";
import { text } from "@i18n";
import Link from "next/link";

/**
 * Top bar of the sidebar drawer: the brand link plus a close button that only
 * shows on mobile (the drawer is dismissible there; persistent on md+).
 */
export function SidebarHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-4 py-3">
      <Link href="/" className="font-display text-base text-ink transition hover:text-ink-muted">
        {text.common.brand}
      </Link>
      <button
        type="button"
        aria-label={text.shell.closeMenu}
        onClick={onClose}
        className="-mr-1 grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition hover:bg-elevated hover:text-ink md:hidden"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

"use client";

import { MenuIcon } from "@components/shell/icons";
import { text } from "@i18n";
import Link from "next/link";

/**
 * Mobile-only bar above the chat: a hamburger that opens the sidebar drawer plus
 * the brand. Hidden on md+, where the sidebar is always visible.
 */
export function MobileTopBar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-line bg-surface px-3 py-2 md:hidden">
      <button
        type="button"
        aria-label={text.shell.openMenu}
        aria-expanded={isOpen}
        onClick={onToggle}
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition hover:bg-elevated hover:text-ink"
      >
        <MenuIcon />
      </button>
      <Link href="/" className="font-display text-sm text-ink">
        {text.common.brand}
      </Link>
    </div>
  );
}

import type { ReactNode } from "react";

/**
 * Shared base for the shell's inline icons — same stroke style used across the
 * app (currentColor, 1.8 stroke, rounded caps). Only the size varies per glyph.
 */
function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
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

/** Hamburger — opens the drawer from the mobile top bar. */
export function MenuIcon() {
  return (
    <Icon size={22}>
      <line x1="3" x2="21" y1="6" y2="6" />
      <line x1="3" x2="21" y1="12" y2="12" />
      <line x1="3" x2="21" y1="18" y2="18" />
    </Icon>
  );
}

/** Close (×) — dismisses the drawer from its header. */
export function CloseIcon() {
  return (
    <Icon size={20}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

/** User glyph — shown in the sidebar user chip. */
export function UserIcon() {
  return (
    <Icon size={16}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

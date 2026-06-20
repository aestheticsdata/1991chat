"use client";

import { text } from "@i18n";

/**
 * Mobile-only dark overlay behind the open drawer — tapping it dismisses the
 * drawer. Unmounted when closed and hidden on md+ (where the sidebar is
 * persistent, so there is nothing to overlay).
 */
export function SidebarScrim({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <button
      type="button"
      aria-label={text.shell.closeMenu}
      onClick={onClose}
      className="fixed inset-0 z-30 bg-black/60 md:hidden"
    />
  );
}

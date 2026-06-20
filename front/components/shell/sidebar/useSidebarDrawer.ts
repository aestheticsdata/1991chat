"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Open/close state for the mobile navigation drawer (the off-canvas sidebar).
 * On md+ the sidebar is always visible, so this state only drives mobile.
 *
 *   isOpen           — whether the drawer is currently shown (mobile)
 *   open/close/toggle — imperative controls for the toggle, scrim and header
 *
 * The drawer auto-closes on route change and when Escape is pressed.
 */
export function useSidebarDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  // Close the drawer after navigating (no-op on md+, where it's always shown).
  // pathname is an intentional trigger: the body doesn't read it, but the effect
  // must re-run on each route change to dismiss the drawer.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Escape closes the open drawer.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return { isOpen, open, close, toggle };
}

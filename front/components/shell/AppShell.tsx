"use client";

import { MobileTopBar } from "@components/shell/MobileTopBar";
import { SidebarDrawer } from "@components/shell/sidebar/SidebarDrawer";
import { SidebarScrim } from "@components/shell/sidebar/SidebarScrim";
import { useSidebarDrawer } from "@components/shell/sidebar/useSidebarDrawer";
import type { ReactNode } from "react";

/**
 * Signed-in shell. Tablet/desktop (md+) keep the persistent sidebar untouched.
 * On mobile the sidebar becomes an off-canvas drawer (80% of the viewport)
 * overlaying the chat + prompt, opened from the top-left button and dismissed by
 * the scrim, a nav, or Escape — so the chat and prompt fill the whole screen.
 *
 *   mobile (closed)            mobile (open)
 *   ┌──────────────┐           ┌───────────━┲━━━━━┓
 *   │ ☰  1991CHAT  │           │ drawer 80% ┃scrim┃
 *   │ chat …      │           │            ┃     ┃
 *   │ prompt …    │           │            ┃     ┃
 *   └──────────────┘           └───────────━┺━━━━━┛
 *
 * Composed from: SidebarScrim (mobile overlay), SidebarDrawer (the sidebar), and
 * a main column with MobileTopBar above the page. Drawer open/close lives in
 * useSidebarDrawer.
 */
export function AppShell({ username, children }: { username: string; children: ReactNode }) {
  const drawer = useSidebarDrawer();

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <SidebarScrim isOpen={drawer.isOpen} onClose={drawer.close} />
      <SidebarDrawer isOpen={drawer.isOpen} onClose={drawer.close} username={username} />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileTopBar isOpen={drawer.isOpen} onToggle={drawer.toggle} />
        {children}
      </main>
    </div>
  );
}

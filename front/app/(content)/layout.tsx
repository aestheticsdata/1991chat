import Link from "next/link";
import type { ReactNode } from "react";
import { Sidebar } from "@components/Sidebar";
import { SidebarAccountNav } from "@components/SidebarAccountNav";
import { SiteHeader } from "@components/SiteHeader";
import { getServerUser } from "@lib/session";

/**
 * Shell for the main content routes (chat · about · change-password). Auth-aware:
 *   - signed in  → persistent sidebar + the page rendered in <main>, no header,
 *     so moving between chat / about / change-password keeps the sidebar mounted.
 *   - signed out → the public top header + the page centered below (e.g. About).
 * Pages still gate themselves where needed (chat & change-password redirect).
 */
export default async function ContentLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50">
        <SiteHeader />
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3">
          <Link href="/" className="font-display text-base text-neutral-900 transition hover:text-neutral-600">
            1991CHAT
          </Link>
        </div>
        <SidebarAccountNav username={user.username} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

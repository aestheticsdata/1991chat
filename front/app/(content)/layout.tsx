import { AppShell } from "@components/AppShell";
import { SiteHeader } from "@components/SiteHeader";
import { getServerUser } from "@lib/session";
import type { ReactNode } from "react";

/**
 * Shell for the main content routes (chat · about · change-password). Auth-aware:
 *   - signed in  → AppShell: persistent sidebar on md+ (an off-canvas drawer on
 *     mobile) + the page in <main>, no header, so the sidebar stays mounted while
 *     moving between chat / about / change-password.
 *   - signed out → the public top header + the page centered below (e.g. About).
 * Pages still gate themselves where needed (chat & change-password redirect).
 */
export default async function ContentLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-canvas">
        <SiteHeader />
        {children}
      </div>
    );
  }

  return <AppShell username={user.username}>{children}</AppShell>;
}

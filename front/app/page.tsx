import { redirect } from "next/navigation";
import { getServerUser } from "@lib/session";
import { LogoutButton } from "@components/auth/LogoutButton";
import { Sidebar } from "@components/Sidebar";
import { ChatDisplay } from "@components/ChatDisplay";
import { Prompt } from "@components/Prompt";

/**
 * App shell + auth gate. Verifies the session server-side (asks the backend who
 * the cookie belongs to) before rendering. The classic layout:
 *   ┌──────────┬───────────────────────────┐
 *   │ Sidebar  │ ChatDisplay (scrolls)      │
 *   │ (w-64)   ├───────────────────────────┤
 *   │          │ Prompt (textarea + ▶/■)    │
 *   └──────────┴───────────────────────────┘
 */
export default async function Page() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <span className="font-semibold">1991chat</span>
          <LogoutButton />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <section className="min-h-0 flex-1 overflow-y-auto">
          <ChatDisplay />
        </section>
        <footer className="shrink-0 border-t border-neutral-200 bg-white">
          <Prompt />
        </footer>
      </main>
    </div>
  );
}

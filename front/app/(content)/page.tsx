import { redirect } from "next/navigation";
import { ChatDisplay } from "@components/ChatDisplay";
import { Prompt } from "@components/Prompt";
import { getServerUser } from "@lib/session";

/**
 * Chat view — fills the shell's <main>. Members-only: redirect to /login when
 * there's no session.
 *   ┌───────────────────────────┐
 *   │ ChatDisplay (scrolls)      │
 *   ├───────────────────────────┤
 *   │ Prompt (textarea + ▶/■)    │
 *   └───────────────────────────┘
 */
export default async function ChatPage() {
  if (!(await getServerUser())) redirect("/login");

  return (
    <>
      <section className="min-h-0 flex-1 overflow-y-auto">
        <ChatDisplay />
      </section>
      <footer className="shrink-0">
        <Prompt />
      </footer>
    </>
  );
}

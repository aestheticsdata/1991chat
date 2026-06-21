// Sidebar — conversation list + "new chat".
// TODO (you): use the conversation service (CSRF + auth handled for you):
//   import { conversationService } from "@services/conversation.service";
//   conversationService.list();         // list conversations
//   conversationService.create(title?); // new chat
//   conversationService.remove(id);     // delete
// The current user is available via useAuth() from "@lib/auth-context".
import { text } from "@i18n";

export function Sidebar() {
  return (
    <nav className="p-3 text-sm text-ink-muted">
      <p className="px-1 font-medium text-ink-faint">{text.chat.conversations}</p>
      {/* TODO: new-chat button + conversation list */}
    </nav>
  );
}

// Sidebar — conversation list + "new chat".
// TODO (you): use apiFetch from '@lib/api' — apiFetch('/conversations') to list,
// apiFetch('/conversations', { method: 'POST', body: '{}' }) to create,
// apiFetch(`/conversations/${id}`, { method: 'DELETE' }) to delete. The current
// user is available via useAuth() from '@lib/auth-context'.
import { text } from "@i18n";

export function Sidebar() {
  return (
    <nav className="p-3 text-sm text-ink-muted">
      <p className="px-1 font-medium text-ink-faint">{text.chat.conversations}</p>
      {/* TODO: new-chat button + conversation list */}
    </nav>
  );
}

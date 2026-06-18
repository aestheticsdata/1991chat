// Sidebar — conversation list + "new chat".
// TODO (you): use apiFetch from '@lib/api' — apiFetch('/conversations') to list,
// apiFetch('/conversations', { method: 'POST', body: '{}' }) to create,
// apiFetch(`/conversations/${id}`, { method: 'DELETE' }) to delete. The current
// user is available via useAuth() from '@lib/auth-context'.
export function Sidebar() {
  return (
    <nav className="p-3 text-sm text-neutral-500">
      <p className="px-1 font-medium text-neutral-400">Conversations</p>
      {/* TODO: new-chat button + conversation list */}
    </nav>
  );
}

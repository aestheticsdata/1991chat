import { MessageList } from '@components/MessageList';

// ChatDisplay — scrollable conversation area.
// TODO (you): load the selected conversation (GET /api/conversations/:id),
// render <MessageList />, handle empty / loading / error, auto-scroll, and the
// live streaming assistant message.
export function ChatDisplay() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <MessageList />
    </div>
  );
}

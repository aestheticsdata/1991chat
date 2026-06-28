// MessageList — render the conversation. Each <Message /> styles itself by role;
// this just stacks them with vertical spacing.
"use client";

import { Message } from "@components/Message";
import { useChatStore } from "@components/stores/chat.store";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <Message key={m.id} role={m.role} content={m.content} status={m.status} />
      ))}
    </div>
  );
}

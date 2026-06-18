/**
 * Who authored a chat message. Mirrors the role vocabulary every mainstream LLM
 * chat API uses, so the domain speaks the same language a real provider would.
 */
export type MessageRole = 'user' | 'assistant' | 'system';

export const MESSAGE_ROLES: readonly MessageRole[] = ['user', 'assistant', 'system'];

export function isMessageRole(value: unknown): value is MessageRole {
  return typeof value === 'string' && (MESSAGE_ROLES as readonly string[]).includes(value);
}

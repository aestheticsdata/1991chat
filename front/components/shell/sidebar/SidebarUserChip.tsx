import { UserIcon } from "@components/shell/icons";

/**
 * User chip pinned to the bottom of the sidebar — a glyph plus the username,
 * truncated with a tooltip when it overflows.
 */
export function SidebarUserChip({ username }: { username: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 border-t border-line px-3 py-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-elevated text-ink-muted">
        <UserIcon />
      </span>
      <span className="truncate text-sm font-medium text-ink-muted" title={username}>
        {username}
      </span>
    </div>
  );
}

import { Sidebar } from "@components/shell/sidebar/Sidebar";
import { SidebarAccountNav } from "@components/shell/sidebar/SidebarAccountNav";
import { SidebarHeader } from "@components/shell/sidebar/SidebarHeader";
import { SidebarUserChip } from "@components/shell/sidebar/SidebarUserChip";

/**
 * The sidebar itself. On md+ it's a persistent column; on mobile it's an
 * off-canvas drawer that slides in from the left (80% width) and is translated
 * off-screen when closed.
 *
 * Top to bottom: header (brand + close), account actions, the scrollable
 * conversation list, and the user chip pinned at the bottom.
 */
export function SidebarDrawer({
  isOpen,
  onClose,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-4/5 shrink-0 flex-col border-r border-line bg-surface transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:translate-x-0 md:transition-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <SidebarHeader onClose={onClose} />
      <SidebarAccountNav />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Sidebar />
      </div>
      <SidebarUserChip username={username} />
    </aside>
  );
}

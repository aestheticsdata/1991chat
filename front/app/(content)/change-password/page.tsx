import { ChangePasswordForm } from "@components/auth/ChangePasswordForm";
import { text } from "@i18n";
import { getServerUser } from "@lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: text.meta.changePasswordTitle };

/** Members-only. The shell layout provides the sidebar around this. */
export default async function ChangePasswordPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <div className="grid flex-1 place-items-center overflow-y-auto p-4">
      <ChangePasswordForm username={user.username} />
    </div>
  );
}

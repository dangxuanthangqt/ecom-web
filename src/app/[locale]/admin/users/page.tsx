import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { UsersAdmin } from "@/components/admin/users-admin";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="users">
      <UsersAdmin />
    </AdminGuard>
  );
}

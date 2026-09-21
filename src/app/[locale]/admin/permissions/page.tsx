import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { PermissionsAdmin } from "@/components/admin/permissions-admin";

export default async function AdminPermissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="permissions">
      <PermissionsAdmin />
    </AdminGuard>
  );
}

import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { RolesAdmin } from "@/components/admin/roles-admin";

export default async function AdminRolesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="roles">
      <RolesAdmin />
    </AdminGuard>
  );
}

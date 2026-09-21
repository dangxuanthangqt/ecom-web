import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { BrandsAdmin } from "@/components/admin/brands-admin";

export default async function AdminBrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="brands">
      <BrandsAdmin />
    </AdminGuard>
  );
}

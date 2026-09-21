import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { CategoriesAdmin } from "@/components/admin/categories-admin";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="categories">
      <CategoriesAdmin />
    </AdminGuard>
  );
}

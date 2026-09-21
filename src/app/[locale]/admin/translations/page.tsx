import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { TranslationsAdmin } from "@/components/admin/translations-admin";

export default async function AdminTranslationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="translations">
      <TranslationsAdmin />
    </AdminGuard>
  );
}

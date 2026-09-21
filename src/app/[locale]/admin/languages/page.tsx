import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { LanguagesAdmin } from "@/components/admin/languages-admin";

export default async function AdminLanguagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="languages">
      <LanguagesAdmin />
    </AdminGuard>
  );
}

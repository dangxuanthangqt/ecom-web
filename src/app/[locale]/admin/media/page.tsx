import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { MediaAdmin } from "@/components/admin/media-admin";

export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="media">
      <MediaAdmin />
    </AdminGuard>
  );
}

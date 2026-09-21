import { setRequestLocale } from "next-intl/server";

import { AdminGuard } from "@/components/admin/admin-guard";
import { ProductsAdmin } from "@/components/admin/products-admin";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <AdminGuard section="products">
      <ProductsAdmin />
    </AdminGuard>
  );
}

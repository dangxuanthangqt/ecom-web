import { setRequestLocale } from "next-intl/server";

import { OrderList } from "@/components/storefront/order-list";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <OrderList />;
}

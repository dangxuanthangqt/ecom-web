import { setRequestLocale } from "next-intl/server";

import { CheckoutView } from "@/components/storefront/checkout-view";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ids?: string }>;
}) {
  const [{ locale }, { ids }] = await Promise.all([params, searchParams]);

  setRequestLocale(locale);

  return <CheckoutView cartItemIds={ids ? ids.split(",").filter(Boolean) : []} />;
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { ProductBrowser } from "@/components/storefront/product-browser";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");

  return { title: t("title") };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);

  setRequestLocale(locale);

  const asArray = (value: string | string[] | undefined) =>
    value === undefined ? undefined : Array.isArray(value) ? value : [value];

  return (
    <ProductBrowser
      initialQuery={{
        keyword: typeof query.keyword === "string" ? query.keyword : undefined,
        brandIds: asArray(query.brandIds),
        categoryIds: asArray(query.categoryIds),
      }}
    />
  );
}

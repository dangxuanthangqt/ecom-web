import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product-purchase-panel";
import { ProductReviews } from "@/components/storefront/product-reviews";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/api/http";
import { apiServer } from "@/lib/api/server";
import { translatedDescription, translatedName } from "@/lib/api/translate";
import type { ProductDetail } from "@/lib/api/types";
import type { Locale } from "@/i18n/routing";

async function loadProduct(id: string) {
  try {
    return await apiServer<ProductDetail>(`/products/${id}`, {
      revalidate: 60,
    });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) return null;

    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await loadProduct(id);

  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  setRequestLocale(locale);

  const product = await loadProduct(id);

  if (!product) notFound();

  const t = await getTranslations("products");
  const name = translatedName(
    product.name,
    product.productTranslations,
    locale as Locale,
  );
  const description = translatedDescription(
    product.productTranslations,
    locale as Locale,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} alt={name} />

        <div className="space-y-6">
          <div className="space-y-2">
            {product.brand?.name ? (
              <Badge variant="secondary">{product.brand.name}</Badge>
            ) : null}
            <h1 className="font-heading text-3xl font-bold text-balance">
              {name}
            </h1>
          </div>

          <ProductPurchasePanel product={product} />

          {product.variants?.length ? (
            <section className="space-y-2">
              <h2 className="font-heading text-lg font-semibold">
                {t("specs")}
              </h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.value}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <dt className="text-xs text-muted-foreground">
                      {variant.value}
                    </dt>
                    <dd className="text-sm font-medium">
                      {variant.options.join(", ")}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="space-y-2">
            <h2 className="font-heading text-lg font-semibold">
              {t("description")}
            </h2>
            <p className="text-sm whitespace-pre-line text-muted-foreground">
              {description || t("noDescription")}
            </p>
          </section>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}

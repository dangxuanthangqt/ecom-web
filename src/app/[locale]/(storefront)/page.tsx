import {
  BadgeCheck,
  Headset,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { apiServer } from "@/lib/api/server";
import type { ListResponse } from "@/lib/api/http";
import type { BrandWithTranslations, Product } from "@/lib/api/types";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations("home");

  // `/products` and `/brands` are the two public list endpoints, so the home
  // page renders for signed-out visitors too.
  const [products, brands] = await Promise.all([
    apiServer<ListResponse<Product>>("/products", {
      query: { page: 1, pageSize: 8, orderBy: "createdAt", order: "desc" },
      revalidate: 60,
      tags: ["products"],
    }).catch(() => null),
    apiServer<ListResponse<BrandWithTranslations>>("/brands", {
      query: { page: 1, pageSize: 12 },
      revalidate: 300,
      tags: ["brands"],
    }).catch(() => null),
  ]);

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-accent to-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="space-y-6">
            <Badge className="bg-cta text-cta-foreground">
              {t("heroBadge")}
            </Badge>
            <h1 className="font-heading text-4xl font-bold text-balance sm:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="max-w-prose text-lg text-muted-foreground">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="cta" size="xl" render={<Link href="/products" />}>
                {t("shopNow")}
              </Button>
              <Button
                variant="outline"
                size="xl"
                render={<Link href="/register" />}
              >
                {/* A label, not a sentence: buttons do not wrap. */}
                {t("createAccount")}
              </Button>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Truck, title: t("whyFast"), body: t("whyFastBody") },
              {
                icon: RotateCcw,
                title: t("whyReturns"),
                body: t("whyReturnsBody"),
              },
              {
                icon: ShieldCheck,
                title: t("whySecure"),
                body: t("whySecureBody"),
              },
              {
                icon: Headset,
                title: t("whySupport"),
                body: t("whySupportBody"),
              },
            ].map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <Icon className="mb-3 size-6 text-primary" aria-hidden="true" />
                <p className="font-heading font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold">{t("featured")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("featuredSubtitle")}
            </p>
          </div>
          <Button variant="outline" render={<Link href="/products" />}>
            {t("browseAll")}
          </Button>
        </div>

        {products?.data.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.data.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("browseAll")}</p>
        )}
      </section>

      {brands?.data.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <h2 className="mb-6 font-heading text-2xl font-bold">
            {t("brands")}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {brands.data.map((brand) => (
              <li key={brand.id}>
                <Link
                  href={`/products?brandIds=${brand.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border-y border-border bg-primary/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-heading text-3xl font-bold text-balance">
            {t("ctaTitle")}
          </h2>
          <p className="max-w-prose text-muted-foreground">{t("ctaBody")}</p>
          <Button variant="cta" size="xl" render={<Link href="/register" />}>
            {t("shopNow")}
          </Button>
        </div>
      </section>
    </>
  );
}

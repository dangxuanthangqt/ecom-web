import { useLocale, useTranslations } from "next-intl";

import { RemoteImage } from "@/components/common/remote-image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { translatedName } from "@/lib/api/translate";
import type { Product } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  priority,
}: {
  product: Product;
  priority?: boolean;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("products");

  const name = translatedName(
    product.name,
    product.productTranslations,
    locale,
  );
  const discounted =
    product.virtualPrice > 0 && product.basePrice < product.virtualPrice;
  const discount = discounted
    ? Math.round((1 - product.basePrice / product.virtualPrice) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group grid-item flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-shadow duration-200 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative">
        <RemoteImage
          src={product.images?.[0]}
          // Decorative: the name is rendered right beside it.
          alt=""
          priority={priority}
          className="aspect-square w-full"
        />
        {discount > 0 ? (
          <Badge className="absolute top-2 left-2 bg-cta text-cta-foreground">
            -{discount}%
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {product.brand?.name ? (
          <p className="text-xs text-muted-foreground">{product.brand.name}</p>
        ) : null}
        <p className="line-clamp-2 font-medium group-hover:text-link">
          {name}
        </p>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-heading text-lg font-bold">
            {formatPrice(product.basePrice, locale)}
          </span>
          {discounted ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.virtualPrice, locale)}
            </span>
          ) : null}
        </div>

        <span className="sr-only">{t("addToCart")}</span>
      </div>
    </Link>
  );
}

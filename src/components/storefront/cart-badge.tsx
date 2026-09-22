"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

import { ButtonLink } from "@/components/common/button-link";
import { useSession } from "@/components/providers/session-provider";
import { useCart } from "@/lib/api/hooks/use-cart";

export function CartBadge() {
  const t = useTranslations("nav");
  const { isAuthenticated } = useSession();
  // Anonymous visitors have no cart to fetch — asking would just 401.
  const { data } = useCart({ page: 1, pageSize: 50 }, isAuthenticated);

  const count = data?.data.length ?? 0;

  return (
    <ButtonLink
      variant="ghost"
      size="sm"
      className="relative"
      // The badge count belongs in the accessible name; a screen reader
      // should not have to guess how full the cart is.
      aria-label={count > 0 ? `${t("cart")}: ${count}` : t("cart")}
      href="/cart"
    >
      <ShoppingCart aria-hidden="true" />
      <span className="hidden sm:inline">{t("cart")}</span>
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-cta px-1 text-[11px] font-semibold text-cta-foreground">
          {count}
        </span>
      ) : null}
    </ButtonLink>
  );
}

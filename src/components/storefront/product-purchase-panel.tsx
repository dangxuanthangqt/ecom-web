"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useAddToCart } from "@/lib/api/hooks/use-cart";
import type { ProductDetail } from "@/lib/api/types";
import { useApiErrorMessage } from "@/lib/api/use-error-toast";
import { formatPrice } from "@/lib/format";
import { cn } from "cn";

export function ProductPurchasePanel({ product }: { product: ProductDetail }) {
  const t = useTranslations("products");
  const errorMessage = useApiErrorMessage();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { isAuthenticated } = useSession();
  const addToCart = useAddToCart();

  const skus = product.skus ?? [];
  const [skuId, setSkuId] = useState(skus[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  const sku = skus.find((item) => item.id === skuId);
  const price = sku?.price ?? product.basePrice;
  const stock = sku?.stock ?? 0;
  const discounted = product.virtualPrice > price;

  const submit = async (thenCheckout: boolean) => {
    if (!isAuthenticated) {
      router.push("/login");

      return;
    }

    if (!sku) return;

    try {
      await addToCart.mutateAsync({ skuId: sku.id, quantity });
      toast.success(t("added"));

      if (thenCheckout) router.push("/cart");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-3xl font-bold">
          {formatPrice(price, locale)}
        </span>
        {discounted ? (
          <span className="text-muted-foreground line-through">
            {formatPrice(product.virtualPrice, locale)}
          </span>
        ) : null}
      </div>

      {skus.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{t("specs")}</legend>
          <ul className="flex flex-wrap gap-2">
            {skus.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={item.stock <= 0}
                  onClick={() => {
                    setSkuId(item.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    item.id === skuId
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {item.value}
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {stock > 0 ? t("inStock", { count: stock }) : t("outOfStock")}
      </p>

      <div className="space-y-2">
        <Label htmlFor="quantity">{t("quantity")}</Label>
        <div className="flex w-36 items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="-"
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Minus aria-hidden="true" />
          </Button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={Math.max(stock, 1)}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.min(
                  Math.max(1, Number(event.target.value) || 1),
                  Math.max(stock, 1),
                ),
              )
            }
            className="h-8 w-full rounded-lg border border-input bg-background text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="+"
            disabled={quantity >= stock}
            onClick={() => setQuantity((value) => value + 1)}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="cta"
          size="xl"
          disabled={!sku || stock <= 0 || addToCart.isPending}
          onClick={() => void submit(false)}
        >
          <ShoppingCart aria-hidden="true" />
          {t("addToCart")}
        </Button>
        <Button
          variant="outline"
          size="xl"
          disabled={!sku || stock <= 0 || addToCart.isPending}
          onClick={() => void submit(true)}
        >
          {t("buyNow")}
        </Button>
      </div>
    </div>
  );
}

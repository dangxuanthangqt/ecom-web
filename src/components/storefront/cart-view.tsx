"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { RemoteImage } from "@/components/common/remote-image";
import { EmptyState, RowsSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/lib/api/hooks/use-cart";
import { ApiError } from "@/lib/api/http";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const { data, isPending } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = useMemo(() => data?.data ?? [], [data]);
  const [selected, setSelected] = useState<string[]>([]);

  const effectiveSelection = selected.filter((id) =>
    items.some((item) => item.id === id),
  );

  const total = items
    .filter((item) => effectiveSelection.includes(item.id))
    .reduce((sum, item) => sum + item.sku.price * item.quantity, 0);

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  const changeQuantity = async (id: string, quantity: number) => {
    try {
      await updateItem.mutateAsync({ id, quantity });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("unexpectedError"),
      );
    }
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <RowsSkeleton rows={4} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <EmptyState
          title={t("empty")}
          action={
            <Button variant="cta" render={<Link href="/products" />}>
              {t("emptyCta")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={
              effectiveSelection.length === items.length && items.length > 0
            }
            onCheckedChange={(checked) =>
              setSelected(checked ? items.map((item) => item.id) : [])
            }
          />
          <Label htmlFor="select-all" className="font-normal">
            {t("selectAll")}
          </Label>
        </div>

        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 rounded-xl border border-border bg-card p-3"
            >
              <Checkbox
                id={`cart-${item.id}`}
                className="mt-1"
                checked={effectiveSelection.includes(item.id)}
                onCheckedChange={() => toggle(item.id)}
              />
              <label htmlFor={`cart-${item.id}`} className="sr-only">
                {item.sku.product.name}
              </label>

              <RemoteImage
                src={item.sku.image}
                alt=""
                sizes="96px"
                className="size-24 shrink-0"
              />

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.sku.product.id}`}
                  className="line-clamp-2 font-medium hover:text-link"
                >
                  {item.sku.product.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.sku.value}
                </p>
                <p className="mt-1 font-heading font-semibold">
                  {formatPrice(item.sku.price, locale)}
                </p>

                <div className="mt-2 flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    aria-label="-"
                    disabled={item.quantity <= 1 || updateItem.isPending}
                    onClick={() =>
                      void changeQuantity(item.id, item.quantity - 1)
                    }
                  >
                    <Minus aria-hidden="true" />
                  </Button>
                  <span className="w-10 text-center text-sm">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    aria-label="+"
                    disabled={
                      item.quantity >= item.sku.stock || updateItem.isPending
                    }
                    onClick={() =>
                      void changeQuantity(item.id, item.quantity + 1)
                    }
                  >
                    <Plus aria-hidden="true" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive"
                    disabled={removeItem.isPending}
                    onClick={async () => {
                      await removeItem.mutateAsync(item.id);
                      toast.success(t("removed"));
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                    {t("remove")}
                  </Button>
                </div>

                {item.quantity >= item.sku.stock ? (
                  <p className="mt-1 text-xs text-warning">
                    {t("stockLimit", { count: item.sku.stock })}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
        <p className="font-heading text-lg font-semibold">{t("total")}</p>
        <p className="text-sm text-muted-foreground">
          {t("selectedCount", { count: effectiveSelection.length })}
        </p>
        <p className="font-heading text-3xl font-bold">
          {formatPrice(total, locale)}
        </p>
        <Button
          variant="cta"
          size="xl"
          className="w-full"
          disabled={effectiveSelection.length === 0}
          onClick={() =>
            router.push(`/checkout?ids=${effectiveSelection.join(",")}`)
          }
        >
          {t("checkout")}
        </Button>
      </aside>
    </div>
  );
}

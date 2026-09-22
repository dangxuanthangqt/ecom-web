"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { RemoteImage } from "@/components/common/remote-image";
import { EmptyState, RowsSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/lib/api/hooks/use-cart";
import { useCreateOrder } from "@/lib/api/hooks/use-orders";
import { useApiErrorMessage } from "@/lib/api/use-error-toast";
import { formatPrice } from "@/lib/format";

export function CheckoutView({ cartItemIds }: { cartItemIds: string[] }) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const errorMessage = useApiErrorMessage();
  const locale = useLocale() as Locale;
  const router = useRouter();

  const { data, isPending } = useCart();
  const createOrder = useCreateOrder();

  const items = (data?.data ?? []).filter((item) =>
    cartItemIds.includes(item.id),
  );
  const total = items.reduce(
    (sum, item) => sum + item.sku.price * item.quantity,
    0,
  );

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <RowsSkeleton rows={3} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title={t("nothingSelected")}
          action={
            <Button variant="cta" render={<Link href="/cart" />}>
              {tCart("title")}
            </Button>
          }
        />
      </div>
    );
  }

  const placeOrder = async () => {
    try {
      const order = await createOrder.mutateAsync(items.map((item) => item.id));

      toast.success(t("placed"));
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">{t("summary")}</h2>

        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <RemoteImage
                src={item.sku.image}
                alt=""
                sizes="64px"
                className="size-16 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.sku.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku.value} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {formatPrice(item.sku.price * item.quantity, locale)}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-heading text-lg font-semibold">
            {tCart("total")}
          </span>
          <span className="font-heading text-2xl font-bold">
            {formatPrice(total, locale)}
          </span>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">{t("note")}</p>

      <Button
        variant="cta"
        size="xl"
        className="w-full"
        disabled={createOrder.isPending}
        onClick={() => void placeOrder()}
      >
        {t("placeOrder")}
      </Button>
    </div>
  );
}

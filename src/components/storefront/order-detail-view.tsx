"use client";

import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ButtonLink } from "@/components/common/button-link";
import { ConfirmButton } from "@/components/common/confirm-button";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { RemoteImage } from "@/components/common/remote-image";
import { ErrorState, RowsSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { useCancelOrder, useOrder } from "@/lib/api/hooks/use-orders";
import { useApiErrorMessage } from "@/lib/api/use-error-toast";
import { formatDate, formatPrice, shortId } from "@/lib/format";

const CANCELLABLE = new Set(["PENDING_CONFIRMATION", "PENDING_PICKUP"]);

export function OrderDetailView({ orderId }: { orderId: string }) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const errorMessage = useApiErrorMessage();
  const locale = useLocale() as Locale;

  const { data, isPending, isError, refetch } = useOrder(orderId);
  const cancelOrder = useCancelOrder();

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <RowsSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title={tCommon("error")}
          retryLabel={tCommon("retry")}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const total = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <ButtonLink variant="ghost" size="sm" href="/orders">
        <ArrowLeft aria-hidden="true" />
        {tCommon("back")}
      </ButtonLink>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">
            {t("detailTitle")} #{shortId(data.id)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("placedAt")} {formatDate(data.createdAt, locale)}
          </p>
        </div>
        <OrderStatusBadge status={data.status} />
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-card px-4">
        {data.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <RemoteImage
              src={item.images?.[0]}
              alt=""
              sizes="64px"
              className="size-16 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {item.skuValue} × {item.quantity}
              </p>
            </div>
            <p className="font-medium">
              {formatPrice(item.price * item.quantity, locale)}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <span className="font-heading text-lg font-semibold">
          {t("total")}
        </span>
        <span className="font-heading text-2xl font-bold">
          {formatPrice(total, locale)}
        </span>
      </div>

      {CANCELLABLE.has(data.status) ? (
        <ConfirmButton
          title={t("cancel")}
          description={t("cancelConfirm")}
          confirmLabel={t("cancel")}
          pending={cancelOrder.isPending}
          onConfirm={async () => {
            try {
              await cancelOrder.mutateAsync(data.id);
              toast.success(t("cancelled"));
            } catch (error) {
              toast.error(errorMessage(error));
            }
          }}
          trigger={<Button variant="destructive">{t("cancel")}</Button>}
        />
      ) : null}
    </div>
  );
}

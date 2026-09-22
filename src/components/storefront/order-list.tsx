"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { NativeSelect } from "@/components/common/native-select";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { PaginationBar } from "@/components/common/pagination-bar";
import { EmptyState, RowsSkeleton } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useOrders } from "@/lib/api/hooks/use-orders";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/api/types";
import { formatDate, shortId } from "@/lib/format";

export function OrderList() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("orders.status");
  const locale = useLocale() as Locale;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<OrderStatus | "">("");

  const { data, isPending } = useOrders({
    page,
    pageSize,
    orderBy: "createdAt",
    order: "desc",
    ...(status ? { status } : {}),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{tCommon("status")}</span>
          <NativeSelect
            className="w-52"
            value={status}
            placeholder={tCommon("all")}
            onChange={(event) => {
              setStatus(event.target.value as OrderStatus | "");
              setPage(1);
            }}
            options={ORDER_STATUSES.map((value) => ({
              value,
              label: tStatus(value),
            }))}
          />
        </label>
      </div>

      {isPending ? <RowsSkeleton rows={4} /> : null}

      {data && data.data.length === 0 ? (
        <EmptyState
          title={t("empty")}
          action={
            <Button variant="cta" render={<Link href="/products" />}>
              {tCommon("view")}
            </Button>
          }
        />
      ) : null}

      <ul className="space-y-3">
        {(data?.data ?? []).map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-heading font-semibold">
                  {t("orderId")} #{shortId(order.id)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("placedAt")} {formatDate(order.createdAt, locale)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </Link>
          </li>
        ))}
      </ul>

      {data && data.pagination.totalItems > 0 ? (
        <PaginationBar
          page={data.pagination.page}
          pageSize={data.pagination.pageSize}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : null}
    </div>
  );
}

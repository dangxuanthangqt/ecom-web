"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage } from "@/components/admin/admin-page";
import { DataTable, type Column } from "@/components/admin/data-table";
import { NativeSelect } from "@/components/common/native-select";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { PaginationBar } from "@/components/common/pagination-bar";
import { RemoteImage } from "@/components/common/remote-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Locale } from "@/i18n/routing";
import {
  useManagedOrder,
  useManagedOrders,
  useUpdateOrderStatus,
} from "@/lib/api/hooks/use-orders";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/api/types";
import { useApiErrors } from "@/lib/api/use-error-toast";
import { formatDate, formatPrice, shortId } from "@/lib/format";

export function OrdersAdmin() {
  const t = useTranslations("admin.order");
  const tAdmin = useTranslations("admin");
  const tTable = useTranslations("admin.table");
  const tOrders = useTranslations("orders");
  const tStatus = useTranslations("orders.status");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isPending } = useManagedOrders({
    pageIndex,
    pageSize,
    keyword: keyword || undefined,
    orderBy: "createdAt",
    order: "desc",
    ...(status ? { status } : {}),
  });
  const { data: detail } = useManagedOrder(detailId ?? undefined);
  const updateStatus = useUpdateOrderStatus();
  const { report } = useApiErrors();

  const columns: Array<Column<Order>> = [
    {
      key: "id",
      header: tOrders("orderId"),
      cell: (row) => (
        <button
          type="button"
          onClick={() => setDetailId(row.id)}
          className="font-mono text-xs text-primary underline underline-offset-4"
        >
          {shortId(row.id)}
        </button>
      ),
    },
    {
      key: "createdAt",
      header: tTable("createdAt"),
      cell: (row) => formatDate(row.createdAt, locale),
    },
    {
      key: "status",
      header: tTable("status"),
      cell: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: t("updateStatus"),
      className: "text-right",
      cell: (row) => (
        <NativeSelect
          className="ml-auto w-52"
          aria-label={t("updateStatus")}
          value={row.status}
          disabled={updateStatus.isPending}
          onChange={async (event) => {
            try {
              await updateStatus.mutateAsync({
                id: row.id,
                status: event.target.value as OrderStatus,
              });
              toast.success(t("statusUpdated"));
            } catch (error) {
              report(error);
            }
          }}
          options={ORDER_STATUSES.map((value) => ({
            value,
            label: tStatus(value),
          }))}
        />
      ),
    },
  ];

  return (
    <AdminPage
      title={tAdmin("orders")}
      keyword={keyword}
      onKeywordChange={(value) => {
        setKeyword(value);
        setPageIndex(0);
      }}
      action={
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("filterStatus")}</span>
          <NativeSelect
            className="w-52"
            value={status}
            placeholder={tCommon("all")}
            onChange={(event) => {
              setStatus(event.target.value as OrderStatus | "");
              setPageIndex(0);
            }}
            options={ORDER_STATUSES.map((value) => ({
              value,
              label: tStatus(value),
            }))}
          />
        </label>
      }
    >
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        isPending={isPending}
      />

      {data ? (
        <PaginationBar
          pageIndex={data.pagination.pageIndex}
          pageSize={data.pagination.pageSize}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
        />
      ) : null}

      <Dialog
        open={Boolean(detailId)}
        onOpenChange={(next) => {
          if (!next) setDetailId(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {tOrders("detailTitle")} #{detail ? shortId(detail.id) : ""}
            </DialogTitle>
          </DialogHeader>

          {detail ? (
            <ul className="divide-y divide-border">
              {detail.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <RemoteImage
                    src={item.images?.[0]}
                    alt={item.productName}
                    sizes="48px"
                    className="size-12 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.skuValue} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity, locale)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <Button variant="outline" onClick={() => setDetailId(null)}>
            {tCommon("close")}
          </Button>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}

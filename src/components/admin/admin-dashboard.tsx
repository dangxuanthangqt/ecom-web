"use client";

import { Boxes, Package, Tags, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { useSession } from "@/components/providers/session-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrands } from "@/lib/api/hooks/use-catalog";
import { useManagedOrders } from "@/lib/api/hooks/use-orders";
import { useManagedProducts } from "@/lib/api/hooks/use-products";
import { useUsers } from "@/lib/api/hooks/use-admin";
import { ORDER_STATUSES } from "@/lib/api/types";
import { canSee } from "@/lib/auth/permissions";

/** One row is enough — only `pagination.totalItems` is being read. */
const COUNT_ONLY = { pageIndex: 0, pageSize: 1 };

export function AdminDashboard() {
  const t = useTranslations("admin");
  const { profile } = useSession();

  const products = useManagedProducts(COUNT_ONLY);
  const orders = useManagedOrders(COUNT_ONLY);
  const users = useUsers(COUNT_ONLY);
  const brands = useBrands(COUNT_ONLY);

  const pending = useManagedOrders({
    ...COUNT_ONLY,
    status: "PENDING_CONFIRMATION",
  });

  const cards: Array<{
    key: string;
    icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
    value?: number;
    loading: boolean;
    visible: boolean;
  }> = [
    {
      key: "products",
      icon: Package,
      value: products.data?.pagination.totalItems,
      loading: products.isPending,
      visible: canSee(profile, "products"),
    },
    {
      key: "orders",
      icon: Boxes,
      value: orders.data?.pagination.totalItems,
      loading: orders.isPending,
      visible: canSee(profile, "orders"),
    },
    {
      key: "users",
      icon: Users,
      value: users.data?.pagination.totalItems,
      loading: users.isPending,
      visible: canSee(profile, "users"),
    },
    {
      key: "brands",
      icon: Tags,
      value: brands.data?.pagination.totalItems,
      loading: brands.isPending,
      visible: canSee(profile, "brands"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground">{t("overview")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards
          .filter((card) => card.visible)
          .map(({ key, icon: Icon, value, loading }) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t(`stats.${key}`)}
                </p>
                <Icon className="size-4 text-primary" aria-hidden={true} />
              </div>
              {loading ? (
                <Skeleton className="mt-2 h-8 w-16" />
              ) : (
                <p className="mt-1 font-heading text-3xl font-bold">
                  {value ?? 0}
                </p>
              )}
            </div>
          ))}
      </div>

      {canSee(profile, "orders") ? (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="font-heading text-lg font-semibold">
            {t("stats.ordersByStatus")}
          </h2>

          <p className="text-sm text-muted-foreground">
            {t("stats.pendingOrders")}:{" "}
            <span className="font-semibold text-foreground">
              {pending.data?.pagination.totalItems ?? 0}
            </span>
          </p>

          <ul className="flex flex-wrap gap-2">
            {ORDER_STATUSES.map((status) => (
              <li key={status}>
                <OrderStatusBadge status={status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

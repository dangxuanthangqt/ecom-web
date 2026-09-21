import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/api/types";
import { cn } from "cn";

/**
 * Status is carried by text first; the colour is a second signal, never the
 * only one.
 */
const TONE: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: "bg-muted text-muted-foreground",
  PENDING_PICKUP: "bg-chart-3/15 text-chart-3",
  PENDING_DELIVERY: "bg-cta/15 text-cta",
  DELIVERED: "bg-primary/15 text-primary",
  RETURNED: "bg-warning/15 text-warning",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");

  return (
    <Badge className={cn("border-transparent", TONE[status])}>
      {t(status)}
    </Badge>
  );
}

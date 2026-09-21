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
  PENDING_PICKUP: "bg-info/15 text-info-strong",
  PENDING_DELIVERY: "bg-cta/15 text-cta-strong",
  DELIVERED: "bg-success/15 text-success-strong",
  RETURNED: "bg-warning/15 text-warning-strong",
  CANCELLED: "bg-destructive/10 text-destructive-strong",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");

  return (
    <Badge className={cn("border-transparent", TONE[status])}>
      {t(status)}
    </Badge>
  );
}

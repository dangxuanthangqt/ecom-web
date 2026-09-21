"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import type { ListResponse } from "../http";
import { queryKeys } from "../query-keys";
import type {
  ManageOrderDetail,
  Order,
  OrderDetail,
  OrderStatus,
  PageQuery,
} from "../types";

export function useOrders(query: PageQuery & { status?: OrderStatus }) {
  return useQuery({
    queryKey: queryKeys.orders(query),
    queryFn: () => apiClient.get<ListResponse<Order>>("/orders", { query }),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(id ?? ""),
    queryFn: () => apiClient.get<OrderDetail>(`/orders/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemIds: string[]) =>
      apiClient.post<OrderDetail>("/orders", { body: { cartItemIds } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.put(`/orders/${id}/cancel`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

export function useManagedOrders(
  query: PageQuery & { status?: OrderStatus; createdById?: string },
) {
  return useQuery({
    queryKey: queryKeys.manageOrders(query),
    queryFn: () =>
      apiClient.get<ListResponse<Order>>("/manage-order/orders", { query }),
  });
}

export function useManagedOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.manageOrder(id ?? ""),
    queryFn: () =>
      apiClient.get<ManageOrderDetail>(`/manage-order/orders/${id}`),
    enabled: Boolean(id),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiClient.put(`/manage-order/orders/${id}/status`, { body: { status } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["manage-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["manage-order"] });
    },
  });
}

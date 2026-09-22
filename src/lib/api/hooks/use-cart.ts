"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import type { ListResponse } from "../http";
import { queryKeys } from "../query-keys";
import type { CartItem, PageQuery } from "../types";

const CART_PAGE = { page: 1, pageSize: 50 } satisfies PageQuery;

export function useCart(query: PageQuery = CART_PAGE, enabled = true) {
  return useQuery({
    queryKey: queryKeys.cart(query),
    queryFn: () => apiClient.get<ListResponse<CartItem>>("/cart", { query }),
    enabled,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { skuId: string; quantity: number }) =>
      apiClient.post<CartItem>("/cart", { body }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      apiClient.put<CartItem>(`/cart/${id}`, { body: { quantity } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/cart/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import type { ListResponse } from "../http";
import { queryKeys } from "../query-keys";
import type { PageQuery, Review } from "../types";

export function useReviews(productId: string, query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.reviews(productId, query),
    queryFn: () =>
      apiClient.get<ListResponse<Review>>("/reviews", {
        query: { ...query, productId },
      }),
    enabled: Boolean(productId),
  });
}

export function useSaveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: { productId?: string; rating: number; content: string };
    }) =>
      id
        ? apiClient.put<Review>(`/reviews/${id}`, {
            body: { rating: body.rating, content: body.content },
          })
        : apiClient.post<Review>("/reviews", { body }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/reviews/${id}`),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

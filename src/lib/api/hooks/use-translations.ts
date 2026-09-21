"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import type { ListResponse } from "../http";
import { queryKeys } from "../query-keys";
import type {
  BrandTranslation,
  CategoryTranslation,
  PageQuery,
  ProductTranslation,
} from "../types";

export type TranslationKind = "brand" | "category" | "product";

const ENDPOINT: Record<TranslationKind, string> = {
  brand: "/brand-translations",
  category: "/category-translations",
  product: "/product-translations",
};

const KEY: Record<TranslationKind, (query: PageQuery) => readonly unknown[]> = {
  brand: queryKeys.brandTranslations,
  category: queryKeys.categoryTranslations,
  product: queryKeys.productTranslations,
};

export type Translation =
  | BrandTranslation
  | CategoryTranslation
  | ProductTranslation;

export function useTranslations(kind: TranslationKind, query: PageQuery) {
  return useQuery({
    queryKey: KEY[kind](query),
    queryFn: () =>
      apiClient.get<ListResponse<Translation>>(ENDPOINT[kind], { query }),
  });
}

export function useSaveTranslation(kind: TranslationKind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: unknown }) =>
      id
        ? apiClient.put(`${ENDPOINT[kind]}/${id}`, { body })
        : apiClient.post(ENDPOINT[kind], { body }),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: [ENDPOINT[kind].slice(1)],
      }),
  });
}

export function useDeleteTranslation(kind: TranslationKind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`${ENDPOINT[kind]}/${id}`),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: [ENDPOINT[kind].slice(1)],
      }),
  });
}

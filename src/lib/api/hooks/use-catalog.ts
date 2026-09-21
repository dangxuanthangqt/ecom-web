"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import type { ListResponse } from "../http";
import { queryKeys } from "../query-keys";
import type {
  BrandWithTranslations,
  CategoryWithChildren,
  Language,
  PageQuery,
} from "../types";

const ALL = { pageSize: 100, pageIndex: 0 } satisfies PageQuery;

export function useBrands(query: PageQuery = ALL) {
  return useQuery({
    queryKey: queryKeys.brands(query),
    queryFn: () =>
      apiClient.get<ListResponse<BrandWithTranslations>>("/brands", { query }),
  });
}

export function useBrand(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.brand(id ?? ""),
    queryFn: () => apiClient.get<BrandWithTranslations>(`/brands/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: unknown }) =>
      id
        ? apiClient.put(`/brands/${id}`, { body })
        : apiClient.post("/brands", { body }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    // The API takes an optional `isHardDelete`; the UI only ever soft-deletes.
    mutationFn: (id: string) =>
      apiClient.delete(`/brands/${id}`, { body: { isHardDelete: false } }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });
}

/** `/categories` is not paginated — it answers with the whole tree. */
export function useCategories(parentCategoryId?: string) {
  return useQuery({
    queryKey: queryKeys.categories(parentCategoryId),
    queryFn: () =>
      apiClient.get<{ data: CategoryWithChildren[]; totalCount: number }>(
        "/categories",
        { query: { parentCategoryId } },
      ),
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.category(id ?? ""),
    queryFn: () => apiClient.get<CategoryWithChildren>(`/categories/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: unknown }) =>
      id
        ? apiClient.put(`/categories/${id}`, { body })
        : apiClient.post("/categories", { body }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: queryKeys.languages,
    queryFn: () =>
      apiClient.get<ListResponse<Language>>("/languages", { query: ALL }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    // Creating a language is a POST to /languages/create, not to /languages.
    mutationFn: ({ id, body }: { id?: string; body: unknown }) =>
      id
        ? apiClient.put(`/languages/${id}`, { body })
        : apiClient.post("/languages/create", { body }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.languages }),
  });
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/languages/${id}`),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.languages }),
  });
}

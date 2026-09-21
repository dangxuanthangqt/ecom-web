"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import { revalidateStorefront } from "../revalidate";
import type { ListResponse } from "../http";
import { queryKeys } from "../query-keys";
import type {
  CreateProductBody,
  PageQuery,
  Product,
  ProductDetail,
  ProductQuery,
  UpdateProductBody,
} from "../types";

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () =>
      apiClient.get<ListResponse<Product>>("/products", { query }),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => apiClient.get<ProductDetail>(`/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useManagedProducts(query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.manageProducts(query),
    queryFn: () =>
      apiClient.get<ListResponse<Product>>("/manage-product/products", {
        query,
      }),
  });
}

export function useManagedProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.manageProduct(id ?? ""),
    queryFn: () =>
      apiClient.get<ProductDetail>(`/manage-product/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id?: string;
      body: CreateProductBody | UpdateProductBody;
    }) =>
      id
        ? apiClient.put<ProductDetail>(`/manage-product/products/${id}`, {
            body,
          })
        : apiClient.post<ProductDetail>("/manage-product/products", { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["manage-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void revalidateStorefront(["products"]);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/manage-product/products/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["manage-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      void revalidateStorefront(["products"]);
    },
  });
}

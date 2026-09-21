"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import type { ListResponse } from "../http";
import { queryKeys } from "../query-keys";
import type {
  PageQuery,
  PermissionWithRoles,
  Role,
  RoleWithPermissions,
  UserItem,
} from "../types";

export function useUsers(query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.users(query),
    queryFn: () => apiClient.get<ListResponse<UserItem>>("/users", { query }),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.user(id ?? ""),
    queryFn: () => apiClient.get<UserItem>(`/users/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: unknown }) =>
      id
        ? apiClient.put(`/users/${id}`, { body })
        : apiClient.post("/users", { body }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useRoles(query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.roles(query),
    queryFn: () => apiClient.get<ListResponse<Role>>("/roles", { query }),
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.role(id ?? ""),
    queryFn: () => apiClient.get<RoleWithPermissions>(`/roles/${id}`),
    enabled: Boolean(id),
  });
}

export function useSaveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: unknown }) =>
      id
        ? apiClient.put(`/roles/${id}`, { body })
        : apiClient.post("/roles", { body }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/roles/${id}`, { body: { isHardDelete: false } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function usePermissions(query: PageQuery) {
  return useQuery({
    queryKey: queryKeys.permissions(query),
    queryFn: () =>
      apiClient.get<ListResponse<PermissionWithRoles>>("/permissions", {
        query,
      }),
  });
}

export function usePermission(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.permission(id ?? ""),
    queryFn: () => apiClient.get<PermissionWithRoles>(`/permissions/${id}`),
    enabled: Boolean(id),
  });
}

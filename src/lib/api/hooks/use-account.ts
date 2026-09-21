"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../client";
import { queryKeys } from "../query-keys";
import type { Profile } from "../types";

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => apiClient.get<Profile>("/profile"),
    enabled,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      name?: string;
      phoneNumber?: string;
      avatar?: string;
    }) => apiClient.put<Profile>("/profile", { body }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: {
      currentPassword: string;
      newPassword: string;
      newConfirmPassword: string;
    }) => apiClient.put("/profile/change-password", { body }),
  });
}

export function useEnableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ secret: string; uri: string }>("/auth/2fa/enable"),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { totpCode?: string; code?: string }) =>
      apiClient.post("/auth/2fa/disable", { body }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (body: {
      email: string;
      type: "REGISTER" | "FORGOT_PASSWORD" | "LOGIN" | "DISABLE_2FA";
    }) => apiClient.post("/auth/otp", { body }),
  });
}

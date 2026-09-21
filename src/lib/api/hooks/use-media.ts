"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "../client";
import type { PresignedUrl, UploadedFile, UploadedFiles } from "../types";

/** `POST /media/upload/image` — the API reads the field named `image`. */
export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();

      body.append("image", file);

      return apiClient.post<UploadedFile>("/media/upload/image", { body });
    },
  });
}

/** `POST /media/upload/array-of-images` — field `files`, ten at most. */
export function useUploadImages() {
  return useMutation({
    mutationFn: (files: File[]) => {
      const body = new FormData();

      for (const file of files.slice(0, 10)) body.append("files", file);

      return apiClient.post<UploadedFiles>("/media/upload/array-of-images", {
        body,
      });
    },
  });
}

/**
 * `POST /media/upload/multiple-images` — the API declares two named fields,
 * `file1` (one file) and `file3` (up to three).
 */
export function useUploadImageFields() {
  return useMutation({
    mutationFn: ({ file1, file3 }: { file1?: File; file3: File[] }) => {
      const body = new FormData();

      if (file1) body.append("file1", file1);
      for (const file of file3.slice(0, 3)) body.append("file3", file);

      return apiClient.post<UploadedFiles>("/media/upload/multiple-images", {
        body,
      });
    },
  });
}

export function usePresignedUrl() {
  return useMutation({
    mutationFn: (query: { key: string; type: string }) =>
      apiClient.get<PresignedUrl>("/media/presigned-url", { query }),
  });
}

export function useDeleteMedia() {
  return useMutation({
    mutationFn: (key: string) =>
      apiClient.delete("/media/delete", { query: { key } }),
  });
}

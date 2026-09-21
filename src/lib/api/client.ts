import { buildPath, parseResponse, type QueryValue } from "./http";

type ClientRequest = {
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Browser-side calls go through `/api/proxy`, which owns the bearer token and
 * the refresh dance. Nothing here ever sees a token.
 */
async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  { query, body, signal }: ClientRequest = {},
): Promise<T> {
  const isFormData = body instanceof FormData;

  const response = await fetch(`/api/proxy${buildPath(path, query)}`, {
    method,
    headers: isFormData ? undefined : { "content-type": "application/json" },
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal,
  });

  return parseResponse<T>(response);
}

export const apiClient = {
  get: <T>(path: string, options?: ClientRequest) =>
    request<T>("GET", path, options),
  post: <T>(path: string, options?: ClientRequest) =>
    request<T>("POST", path, options),
  put: <T>(path: string, options?: ClientRequest) =>
    request<T>("PUT", path, options),
  patch: <T>(path: string, options?: ClientRequest) =>
    request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: ClientRequest) =>
    request<T>("DELETE", path, options),
};

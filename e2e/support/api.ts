import { request, type APIRequestContext } from "@playwright/test";

const MOCK_API_PORT = Number(process.env.MOCK_API_PORT ?? 4010);

export const mockApiURL =
  process.env.E2E_API_URL ?? `http://localhost:${MOCK_API_PORT}`;

/** Control channel into the mock API. Not part of the real API's surface. */
export async function withMockApi<T>(
  run: (api: APIRequestContext) => Promise<T>,
): Promise<T> {
  const api = await request.newContext({ baseURL: mockApiURL });

  try {
    return await run(api);
  } finally {
    await api.dispose();
  }
}

export const resetMockApi = () =>
  withMockApi((api) => api.post("/__test__/reset"));

/** Invalidates every access token minted so far, so the next call 401s. */
export const expireAccessTokens = () =>
  withMockApi((api) => api.post("/__test__/expire-access-tokens"));

export const readMockState = () =>
  withMockApi(async (api) => (await api.get("/__test__/state")).json());

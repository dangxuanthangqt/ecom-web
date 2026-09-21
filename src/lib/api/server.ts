import "server-only";

import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { apiLanguageByLocale, routing, type Locale } from "@/i18n/routing";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

import { buildPath, parseResponse, type QueryValue } from "./http";

export const API_URL = process.env.API_URL ?? "http://localhost:4000";

type ServerRequest = {
  query?: Record<string, QueryValue>;
  body?: unknown;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Seconds. Omit for always-fresh (the default for anything user-scoped). */
  revalidate?: number;
  tags?: string[];
};

/**
 * Server-side calls go straight to Nest — no point hopping through our own
 * proxy when we can read the cookie right here.
 */
export async function apiServer<T>(
  path: string,
  { query, body, method = "GET", revalidate, tags }: ServerRequest = {},
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const response = await fetch(`${API_URL}${buildPath(path, query)}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-lang": apiLanguageByLocale[await currentLocale()],
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    next: revalidate === undefined ? { tags } : { revalidate, tags },
    cache: revalidate === undefined ? "no-store" : undefined,
  });

  return parseResponse<T>(response);
}

async function currentLocale(): Promise<Locale> {
  try {
    return (await getLocale()) as Locale;
  } catch {
    return routing.defaultLocale;
  }
}

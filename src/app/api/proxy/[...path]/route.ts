import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { apiLanguageByLocale, routing, type Locale } from "@/i18n/routing";
import { API_URL } from "@/lib/api/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  type TokenPair,
} from "@/lib/auth/cookies";

type RouteContext = { params: Promise<{ path: string[] }> };

/**
 * Endpoints that mint or spend tokens. They are handled by `/api/auth/*`, which
 * keeps the tokens in httpOnly cookies — proxying them would hand the raw
 * tokens straight back to the browser and undo the whole arrangement.
 */
const TOKEN_ENDPOINTS = new Set([
  "auth/login",
  "auth/logout",
  "auth/refresh-token",
]);

/**
 * The single door between the browser and the Nest API.
 *
 * It exists so the access and refresh tokens can stay in httpOnly cookies:
 * the browser sends a plain same-origin request, this handler attaches the
 * bearer, and on a 401 it spends the refresh token once and replays the call.
 */
async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const cookieStore = await cookies();

  const route = path.join("/");

  if (TOKEN_ENDPOINTS.has(route)) {
    return NextResponse.json(
      {
        statusCode: 404,
        error: "NOT_PROXYABLE",
        message: `Use /api/auth/* for ${route}.`,
        details: [],
      },
      { status: 404 },
    );
  }

  const target = `${API_URL}/${route}${request.nextUrl.search}`;
  const body =
    request.method === "GET" || request.method === "DELETE"
      ? undefined
      : Buffer.from(await request.arrayBuffer());

  const locale = (cookieStore.get("NEXT_LOCALE")?.value ??
    routing.defaultLocale) as Locale;

  const forward = (accessToken?: string) =>
    fetch(target, {
      method: request.method,
      headers: outboundHeaders(request, locale, accessToken),
      body: body && body.length > 0 ? body : undefined,
      redirect: "manual",
      cache: "no-store",
    });

  let upstream = await forward(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
  let refreshed: TokenPair | null = null;

  if (upstream.status === 401) {
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    refreshed = refreshToken ? await refresh(refreshToken) : null;

    if (refreshed) {
      upstream = await forward(refreshed.accessToken);
    } else if (refreshToken) {
      const dead = await toNextResponse(upstream);

      clearAuthCookies(dead);

      return dead;
    }
  }

  const response = await toNextResponse(upstream);

  if (refreshed) setAuthCookies(response, refreshed);

  return response;
}

function outboundHeaders(
  request: NextRequest,
  locale: Locale,
  accessToken?: string,
) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");

  // Multipart bodies carry their boundary in the content-type, so it has to be
  // copied verbatim rather than rebuilt.
  if (contentType) headers.set("content-type", contentType);

  headers.set("accept", "application/json");
  headers.set("x-lang", apiLanguageByLocale[locale]);

  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);

  return headers;
}

async function refresh(refreshToken: string): Promise<TokenPair | null> {
  const response = await fetch(`${API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const tokens = (await response.json()) as Partial<TokenPair>;

  return tokens.accessToken && tokens.refreshToken
    ? { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
    : null;
}

async function toNextResponse(upstream: Response) {
  const payload = await upstream.arrayBuffer();

  return new NextResponse(payload.byteLength > 0 ? payload : null, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;

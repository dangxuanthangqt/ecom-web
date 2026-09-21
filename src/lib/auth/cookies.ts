import "server-only";

import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "ecom_at";
export const REFRESH_TOKEN_COOKIE = "ecom_rt";

/**
 * Tokens never reach client JavaScript. The browser calls `/api/proxy/*`, and
 * the route handler is what attaches the bearer — an XSS that reads
 * `document.cookie` still walks away with nothing.
 */
const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

export type TokenPair = { accessToken: string; refreshToken: string };

export function setAuthCookies(response: NextResponse, tokens: TokenPair) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: 60 * 60, // an hour is plenty; the refresh token carries the session
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}

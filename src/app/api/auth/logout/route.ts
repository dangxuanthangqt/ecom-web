import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/api/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
} from "@/lib/auth/cookies";

/**
 * Revokes the device server-side, then drops the cookies. A failed upstream
 * call still clears them — a client that cannot reach the API should not stay
 * "logged in" in the UI.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
      // Best effort: the cookies go regardless.
    }
  }

  const response = NextResponse.json({ ok: true });

  clearAuthCookies(response);

  return response;
}

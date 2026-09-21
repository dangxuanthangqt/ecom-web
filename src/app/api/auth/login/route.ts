import { NextRequest, NextResponse } from "next/server";

import { apiLanguageByLocale, routing, type Locale } from "@/i18n/routing";
import { API_URL } from "@/lib/api/server";
import { setAuthCookies, type TokenPair } from "@/lib/auth/cookies";

/**
 * Exchanges credentials for a session. The token pair stops here and becomes
 * two httpOnly cookies; the browser only ever learns whether it worked.
 */
export async function POST(request: NextRequest) {
  const locale = (request.cookies.get("NEXT_LOCALE")?.value ??
    routing.defaultLocale) as Locale;

  const upstream = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-lang": apiLanguageByLocale[locale],
    },
    body: await request.text(),
    cache: "no-store",
  });

  const payload = (await upstream.json()) as Partial<TokenPair> &
    Record<string, unknown>;

  if (!upstream.ok) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  if (!payload.accessToken || !payload.refreshToken) {
    return NextResponse.json(
      {
        statusCode: 502,
        error: "MALFORMED_LOGIN_RESPONSE",
        message: "The API did not return a token pair.",
        details: [],
      },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ ok: true });

  setAuthCookies(response, {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  return response;
}

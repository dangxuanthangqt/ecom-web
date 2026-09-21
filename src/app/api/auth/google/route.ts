import { NextRequest, NextResponse } from "next/server";

import { setAuthCookies } from "@/lib/auth/cookies";

/**
 * Nest finishes the Google flow by redirecting the browser to this app with
 * `accessToken` and `refreshToken` in the query string. The callback page hands
 * them here so they land in httpOnly cookies and leave the URL behind.
 */
export async function POST(request: NextRequest) {
  const { accessToken, refreshToken } = (await request.json()) as {
    accessToken?: string;
    refreshToken?: string;
  };

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      {
        statusCode: 400,
        error: "MISSING_TOKENS",
        message: "Both accessToken and refreshToken are required.",
        details: [],
      },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ ok: true });

  setAuthCookies(response, { accessToken, refreshToken });

  return response;
}

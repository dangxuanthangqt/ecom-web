import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";

/**
 * Storefront pages are cached for a minute, which is right for traffic and
 * wrong right after an admin edits the catalogue. A save posts here so the
 * next visitor sees the new data instead of waiting out the window.
 *
 * Only these tags can be dropped, so the endpoint cannot be used to flush
 * anything else, and it needs a session — cache busting is cheap, but not free.
 */
const ALLOWED_TAGS = new Set(["products", "brands", "categories"]);

export async function POST(request: NextRequest) {
  if (!request.cookies.get(REFRESH_TOKEN_COOKIE)) {
    return NextResponse.json(
      {
        statusCode: 401,
        error: "UNAUTHORIZED",
        message: "A session is required.",
        details: [],
      },
      { status: 401 },
    );
  }

  const { tags } = (await request.json()) as { tags?: string[] };
  const accepted = (tags ?? []).filter((tag) => ALLOWED_TAGS.has(tag));

  for (const tag of accepted) revalidateTag(tag);

  return NextResponse.json({ revalidated: accepted });
}

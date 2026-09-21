import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";

const intlMiddleware = createMiddleware(routing);

/** Route prefixes (locale stripped) that need a session to be worth rendering. */
const PROTECTED_PREFIXES = ["/account", "/cart", "/checkout", "/orders", "/admin"];

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pathWithoutLocale = stripLocale(pathname);

  const needsSession = PROTECTED_PREFIXES.some(
    (prefix) =>
      pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`),
  );

  // Only the refresh token is checked: the access token expires on its own and
  // the proxy renews it. Bouncing on an expired access token would log people
  // out every hour for no reason.
  if (needsSession && !request.cookies.get(REFRESH_TOKEN_COOKIE)) {
    const locale = localeOf(pathname);
    const login = new URL(`/${locale}/login`, request.url);

    login.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(login);
  }

  return intlMiddleware(request);
}

function localeOf(pathname: string) {
  const [, first] = pathname.split("/");

  return routing.locales.includes(first as (typeof routing.locales)[number])
    ? first
    : routing.defaultLocale;
}

function stripLocale(pathname: string) {
  const locale = localeOf(pathname);

  return pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};

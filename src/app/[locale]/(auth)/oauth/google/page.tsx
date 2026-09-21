import { setRequestLocale } from "next-intl/server";

import { GoogleCallback } from "@/components/auth/google-callback";

/**
 * Nest redirects here with the token pair in the query string. The page hands
 * them to `/api/auth/google`, which stores them as httpOnly cookies, and then
 * replaces the history entry so the tokens do not linger in the URL bar.
 */
export default async function GoogleCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    accessToken?: string;
    refreshToken?: string;
    errorMessage?: string;
  }>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);

  setRequestLocale(locale);

  return (
    <GoogleCallback
      accessToken={query.accessToken}
      refreshToken={query.refreshToken}
      errorMessage={query.errorMessage}
    />
  );
}

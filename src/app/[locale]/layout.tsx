import type { Metadata } from "next";
import { Be_Vietnam_Pro, Nunito_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";

import "../globals.css";

/**
 * MASTER.md pairs Rubik with Nunito Sans, but Rubik ships no `vietnamese`
 * subset — every Vietnamese heading would fall back to a system font. Be
 * Vietnam Pro keeps the geometric grotesque voice and covers the diacritics.
 */
const heading = Be_Vietnam_Pro({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Ecom", template: "%s · Ecom" },
  description: "Storefront and administration for the Ecom API.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const hasSessionCookie = Boolean(
    (await cookies()).get(REFRESH_TOKEN_COOKIE),
  );

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable}`}>
        <NextIntlClientProvider>
          <QueryProvider>
            <SessionProvider hasSessionCookie={hasSessionCookie}>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </SessionProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

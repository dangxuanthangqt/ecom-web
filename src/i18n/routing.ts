import { defineRouting } from "next-intl/routing";

export const locales = ["vi", "en"] as const;

export type Locale = (typeof locales)[number];

/**
 * The backend resolves translations from the `x-lang` header and its i18n
 * folders are named `en` / `vn` — not the ISO `vi` we use in the URL.
 */
export const apiLanguageByLocale: Record<Locale, string> = {
  vi: "vn",
  en: "en",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "vi",
  localePrefix: "always",
});

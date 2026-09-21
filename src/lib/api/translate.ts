import type { Locale } from "@/i18n/routing";
import { apiLanguageByLocale } from "@/i18n/routing";

type Translated = {
  name?: string;
  description?: string;
  language?: { id: string } | null;
};

/**
 * Records carry a `*Translations` array keyed by language id. Pick the row for
 * the active locale, and fall back to whatever the record itself says when the
 * translation is missing — a half-translated catalogue should still render.
 */
export function pickTranslation<T extends Translated>(
  translations: T[] | undefined,
  locale: Locale,
): T | undefined {
  if (!translations?.length) return undefined;

  const wanted = apiLanguageByLocale[locale];

  return (
    translations.find((item) => item.language?.id === wanted) ??
    translations.find((item) => item.language?.id === "en")
  );
}

export function translatedName<T extends Translated>(
  fallback: string,
  translations: T[] | undefined,
  locale: Locale,
) {
  return pickTranslation(translations, locale)?.name || fallback;
}

export function translatedDescription<T extends Translated>(
  translations: T[] | undefined,
  locale: Locale,
) {
  return pickTranslation(translations, locale)?.description ?? "";
}

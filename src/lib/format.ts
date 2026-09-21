/**
 * The API exposes prices as plain numbers with no currency field, and the
 * seeded data reads as USD (19.99, 100, …). One constant so the day a currency
 * arrives on the payload there is a single place to change.
 */
export const CURRENCY = "USD";

export function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY,
  }).format(value);
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(value: string | Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateOnly(value: string | Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

/** Short, stable stand-in for a UUID in a dense table. */
export function shortId(id: string) {
  return id.slice(0, 8);
}

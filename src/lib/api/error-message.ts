import { ApiError, type ApiErrorDetail } from "./http";

/**
 * The shape both `useTranslations("errors")` and `getTranslations("errors")`
 * satisfy, so the same resolver serves client and server components.
 */
type ErrorTranslator = {
  (key: string): string;
  has: (key: string) => boolean;
};

/**
 * Turns an API failure into copy for this locale.
 *
 * The API answers with a machine code (`error`) and an English `message` written
 * for the log, not for a customer. The code is what we translate; the message is
 * the net underneath it, for a code the API has registered but this app has not
 * given copy to yet. A code we do not recognise therefore degrades to English
 * rather than to nothing.
 */
export function resolveApiErrorMessage(
  error: unknown,
  t: ErrorTranslator,
  fallback: string,
): string {
  if (!(error instanceof ApiError)) return fallback;

  return t.has(error.code) ? t(error.code) : error.message || fallback;
}

/**
 * The same translation, per field, for marking inputs on a form.
 *
 * A detail entry carries either a registered rule code or a class-validator
 * constraint name (`isEmail`, `minLength`). Only the first has copy here, so the
 * constraint case keeps the server's own text — it interpolates limits we do not
 * receive separately, and rewording it here would drop the number.
 */
export function resolveApiFieldErrors(
  error: unknown,
  t: ErrorTranslator,
): Record<string, string> {
  if (!(error instanceof ApiError)) return {};

  const out: Record<string, string> = {};

  for (const detail of error.details as ApiErrorDetail[]) {
    if (!detail.field) continue;

    const code = typeof detail.code === "string" ? detail.code : undefined;
    const translated = code && t.has(code) ? t(code) : detail.message;

    if (translated) out[detail.field] = translated;
  }

  return out;
}

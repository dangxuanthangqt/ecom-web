"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCallback, useState } from "react";

import { resolveApiErrorMessage, resolveApiFieldErrors } from "./error-message";

/**
 * Resolves an API failure to copy in the active locale.
 *
 * Components that only need the sentence — a toast, an inline banner — use this
 * instead of reading `error.message`, which is the API's English log text.
 */
export function useApiErrorMessage() {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");

  return useCallback(
    (error: unknown) =>
      resolveApiErrorMessage(error, t, tCommon("unexpectedError")),
    [t, tCommon],
  );
}

/**
 * The per-field half of the same translation, for forms that keep their own
 * error state rather than using {@link useApiErrors}.
 */
export function useApiFieldErrors() {
  const t = useTranslations("errors");

  return useCallback((error: unknown) => resolveApiFieldErrors(error, t), [t]);
}

/**
 * Every admin form does the same thing with a failure: toast the message and
 * pin the per-field details next to their inputs.
 */
export function useApiErrors() {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const report = useCallback(
    (error: unknown) => {
      setErrors(resolveApiFieldErrors(error, t));
      toast.error(resolveApiErrorMessage(error, t, tCommon("unexpectedError")));
    },
    [t, tCommon],
  );

  return { errors, setErrors, report, reset: () => setErrors({}) };
}

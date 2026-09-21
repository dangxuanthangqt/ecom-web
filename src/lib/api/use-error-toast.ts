"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCallback, useState } from "react";

import { ApiError } from "./http";

/**
 * Every admin form does the same thing with a failure: toast the message and
 * pin the per-field details next to their inputs.
 */
export function useApiErrors() {
  const t = useTranslations("common");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const report = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        toast.error(error.message);

        return;
      }

      toast.error(t("unexpectedError"));
    },
    [t],
  );

  return { errors, setErrors, report, reset: () => setErrors({}) };
}

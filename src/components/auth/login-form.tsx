"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { GoogleButton } from "@/components/auth/google-button";
import { Field } from "@/components/common/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import type { ApiErrorBody } from "@/lib/api/http";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setPending(true);

    const data = new FormData(event.currentTarget);

    try {
      // Straight to the Next route, not the API: the token pair must become
      // httpOnly cookies before it ever reaches this component.
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email")),
          password: String(data.get("password")),
          totpCode: String(data.get("totpCode") || "") || undefined,
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiErrorBody;

        setErrors(
          Object.fromEntries(
            (body.details ?? [])
              .filter((detail) => detail.field && detail.message)
              .map((detail) => [
                detail.field as string,
                detail.message as string,
              ]),
          ),
        );
        toast.error(body.message ?? tCommon("unexpectedError"));

        return;
      }

      queryClient.clear();
      router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch {
      toast.error(tCommon("unexpectedError"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold">{t("loginTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field id="email" label={t("email")} error={errors.email} required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </Field>

        <Field
          id="password"
          label={t("password")}
          error={errors.password}
          required
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Field id="totpCode" label={t("totpCode")} hint={t("totpHint")}>
          <Input
            id="totpCode"
            name="totpCode"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
          />
        </Field>

        <Button
          type="submit"
          variant="cta"
          size="xl"
          className="w-full"
          disabled={pending}
        >
          {t("signIn")}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("orContinueWith")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <Link
          href="/forgot-password"
          className="text-link underline underline-offset-4"
        >
          {t("forgotPassword")}
        </Link>
        <span className="text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="text-link underline underline-offset-4"
          >
            {t("signUp")}
          </Link>
        </span>
      </div>
    </div>
  );
}

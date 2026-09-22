"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/common/button-link";
import { useRouter } from "@/i18n/navigation";

export function GoogleCallback({
  accessToken,
  refreshToken,
  errorMessage,
}: {
  accessToken?: string;
  refreshToken?: string;
  errorMessage?: string;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [failed, setFailed] = useState(Boolean(errorMessage));

  useEffect(() => {
    if (errorMessage || !accessToken || !refreshToken) {
      setFailed(true);

      return;
    }

    let cancelled = false;

    void (async () => {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken }),
      });

      if (cancelled) return;

      if (response.ok) {
        router.replace("/");
        router.refresh();
      } else {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, refreshToken, errorMessage, router]);

  if (failed) {
    return (
      <div className="space-y-4 rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-lg">
        <p className="font-heading text-lg font-semibold">
          {t("googleFailed")}
        </p>
        <ButtonLink variant="cta" href="/login">
          {t("signIn")}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 shadow-lg">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{t("googleWorking")}</p>
    </div>
  );
}

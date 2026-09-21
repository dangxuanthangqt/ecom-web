"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Field } from "@/components/common/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDisableTwoFactor,
  useEnableTwoFactor,
  useSendOtp,
} from "@/lib/api/hooks/use-account";
import { useApiErrors } from "@/lib/api/use-error-toast";

export function TwoFactorPanel({ email }: { email: string }) {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");

  const enable = useEnableTwoFactor();
  const disable = useDisableTwoFactor();
  const sendOtp = useSendOtp();

  const [secret, setSecret] = useState<{ secret: string; uri: string } | null>(
    null,
  );
  const [totpCode, setTotpCode] = useState("");
  const [code, setCode] = useState("");
  // Same treatment as every other form: the summary goes to a toast, the
  // per-field detail sits under the field that caused it.
  const { errors, report, reset } = useApiErrors();

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
        <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
        {t("twoFactor")}
      </h2>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="cta"
          disabled={enable.isPending}
          onClick={async () => {
            try {
              setSecret(await enable.mutateAsync());
              toast.success(t("twoFactorEnabled"));
            } catch (error) {
              report(error);
            }
          }}
        >
          {t("enable2fa")}
        </Button>

        <Button
          variant="outline"
          disabled={sendOtp.isPending}
          onClick={async () => {
            try {
              await sendOtp.mutateAsync({ email, type: "DISABLE_2FA" });
              toast.success(tAuth("otpSent"));
            } catch (error) {
              report(error);
            }
          }}
        >
          {tAuth("sendOtp")}
        </Button>
      </div>

      {secret ? (
        <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <p>{t("scanQr")}</p>
          <p className="font-mono break-all">
            {t("secret")}: {secret.secret}
          </p>
          <a
            href={secret.uri}
            className="text-link underline underline-offset-4"
          >
            {secret.uri}
          </a>
        </div>
      ) : null}

      <form
        className="space-y-3 border-t border-border pt-4"
        onSubmit={async (event) => {
          event.preventDefault();
          reset();

          try {
            await disable.mutateAsync({
              totpCode: totpCode || undefined,
              code: code || undefined,
            });
            toast.success(t("twoFactorDisabled"));
            setTotpCode("");
            setCode("");
          } catch (error) {
            report(error);
          }
        }}
      >
        <p className="text-sm text-muted-foreground">{t("disableHint")}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="totpCode" label={tAuth("totpCode")} error={errors.totpCode}>
            <Input
              id="totpCode"
              inputMode="numeric"
              maxLength={6}
              value={totpCode}
              onChange={(event) => setTotpCode(event.target.value)}
            />
          </Field>

          <Field id="otpCode" label={tAuth("otpCode")} error={errors.code}>
            <Input
              id="otpCode"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </Field>
        </div>

        <Button
          type="submit"
          variant="destructive"
          disabled={disable.isPending || (!totpCode && !code)}
        >
          {t("disable2fa")}
        </Button>
      </form>
    </section>
  );
}

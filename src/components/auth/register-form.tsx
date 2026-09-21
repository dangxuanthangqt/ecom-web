"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { GoogleButton } from "@/components/auth/google-button";
import { OtpRequestButton } from "@/components/auth/otp-request-button";
import { Field } from "@/components/common/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/navigation";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/http";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    avatar: "",
    code: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: t("passwordMismatch") });

      return;
    }

    setPending(true);

    try {
      await apiClient.post("/auth/register", {
        body: { ...form, avatar: form.avatar || undefined },
      });
      toast.success(t("registered"));
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        toast.error(error.message);
      } else {
        toast.error(tCommon("unexpectedError"));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold">
          {t("registerTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("registerSubtitle")}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field id="email" label={t("email")} error={errors.email} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => set("email")(event.target.value)}
          />
        </Field>

        <Field id="name" label={t("name")} error={errors.name} required>
          <Input
            id="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(event) => set("name")(event.target.value)}
          />
        </Field>

        <Field
          id="phoneNumber"
          label={t("phoneNumber")}
          error={errors.phoneNumber}
          required
        >
          <Input
            id="phoneNumber"
            inputMode="tel"
            autoComplete="tel"
            required
            value={form.phoneNumber}
            onChange={(event) => set("phoneNumber")(event.target.value)}
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
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={form.password}
            onChange={(event) => set("password")(event.target.value)}
          />
        </Field>

        <Field
          id="confirmPassword"
          label={t("confirmPassword")}
          error={errors.confirmPassword}
          required
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={form.confirmPassword}
            onChange={(event) => set("confirmPassword")(event.target.value)}
          />
        </Field>

        <Field id="avatar" label={t("avatar")} error={errors.avatar}>
          <Input
            id="avatar"
            type="url"
            value={form.avatar}
            onChange={(event) => set("avatar")(event.target.value)}
          />
        </Field>

        <Field
          id="code"
          label={t("otpCode")}
          hint={t("otpHint")}
          error={errors.code}
          required
        >
          <div className="flex gap-2">
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={form.code}
              onChange={(event) => set("code")(event.target.value)}
            />
            <OtpRequestButton email={form.email} type="REGISTER" />
          </div>
        </Field>

        <Button
          type="submit"
          variant="cta"
          size="xl"
          className="w-full"
          disabled={pending}
        >
          {t("signUp")}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {t("orContinueWith")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary underline underline-offset-4">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

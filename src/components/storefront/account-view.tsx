"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Field } from "@/components/common/field";
import { RowsSkeleton } from "@/components/common/states";
import { TwoFactorPanel } from "@/components/storefront/two-factor-panel";
import { useSession } from "@/components/providers/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useChangePassword,
  useUpdateProfile,
} from "@/lib/api/hooks/use-account";
import {
  useApiErrorMessage,
  useApiFieldErrors,
} from "@/lib/api/use-error-toast";

export function AccountView() {
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const errorMessage = useApiErrorMessage();
  const fieldErrors = useApiFieldErrors();
  const { profile, isLoading } = useSession();

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [form, setForm] = useState({ name: "", phoneNumber: "", avatar: "" });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        avatar: profile.avatar ?? "",
      });
    }
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <RowsSkeleton rows={5} />
      </div>
    );
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileErrors({});

    try {
      await updateProfile.mutateAsync({
        name: form.name,
        phoneNumber: form.phoneNumber,
        avatar: form.avatar || undefined,
      });
      toast.success(t("profileUpdated"));
    } catch (error) {
      setProfileErrors(fieldErrors(error));
      toast.error(errorMessage(error));
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordErrors({});

    const data = new FormData(event.target as HTMLFormElement);
    const newPassword = String(data.get("newPassword"));
    const newConfirmPassword = String(data.get("newConfirmPassword"));

    if (newPassword !== newConfirmPassword) {
      setPasswordErrors({ newConfirmPassword: tAuth("passwordMismatch") });

      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: String(data.get("currentPassword")),
        newPassword,
        newConfirmPassword,
      });
      toast.success(t("passwordChanged"));
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      setPasswordErrors(fieldErrors(error));
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{profile.email}</span>
          <Badge variant="secondary">
            {t("role")}: {profile.role?.name}
          </Badge>
          <Badge variant="outline">
            {t("status")}: {profile.status}
          </Badge>
        </div>
      </header>

      <form
        onSubmit={saveProfile}
        className="space-y-4 rounded-xl border border-border bg-card p-5"
      >
        <h2 className="font-heading text-lg font-semibold">{t("profile")}</h2>

        <Field id="name" label={tAuth("name")} error={profileErrors.name} required>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, name: event.target.value }))
            }
          />
        </Field>

        <Field
          id="phoneNumber"
          label={tAuth("phoneNumber")}
          error={profileErrors.phoneNumber}
          required
        >
          <Input
            id="phoneNumber"
            required
            inputMode="tel"
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                phoneNumber: event.target.value,
              }))
            }
          />
        </Field>

        <Field id="avatar" label={tAuth("avatar")} error={profileErrors.avatar}>
          <Input
            id="avatar"
            type="url"
            value={form.avatar}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                avatar: event.target.value,
              }))
            }
          />
        </Field>

        <Button type="submit" variant="cta" disabled={updateProfile.isPending}>
          {t("updateProfile")}
        </Button>
      </form>

      <form
        onSubmit={savePassword}
        className="space-y-4 rounded-xl border border-border bg-card p-5"
      >
        <h2 className="font-heading text-lg font-semibold">
          {t("changePassword")}
        </h2>

        <Field
          id="currentPassword"
          label={t("currentPassword")}
          error={passwordErrors.currentPassword}
          required
        >
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        <Field
          id="newPassword"
          label={t("newPassword")}
          error={passwordErrors.newPassword}
          required
        >
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </Field>

        <Field
          id="newConfirmPassword"
          label={t("confirmNewPassword")}
          error={passwordErrors.newConfirmPassword}
          required
        >
          <Input
            id="newConfirmPassword"
            name="newConfirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </Field>

        <Button type="submit" variant="cta" disabled={changePassword.isPending}>
          {t("changePassword")}
        </Button>
      </form>

      <TwoFactorPanel email={profile.email} />
    </div>
  );
}

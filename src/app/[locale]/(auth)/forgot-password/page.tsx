import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");

  return { title: t("forgotTitle") };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <ForgotPasswordForm />;
}

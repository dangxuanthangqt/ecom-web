import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RegisterForm } from "@/components/auth/register-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");

  return { title: t("signUp") };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <RegisterForm />;
}

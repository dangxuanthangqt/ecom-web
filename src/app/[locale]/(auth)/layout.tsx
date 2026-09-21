import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-accent to-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" aria-hidden="true" />
          </span>
          {t("appName")}
        </Link>
        <LocaleSwitcher />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

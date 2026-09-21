"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const LABEL: Record<Locale, string> = { vi: "Tiếng Việt", en: "English" };

export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    // `pathname` already has the locale stripped and the dynamic segments
    // resolved, so the same page reopens in the other language.
    startTransition(() => router.replace(pathname, { locale: next }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            // WCAG 2.5.3: the visible label has to be part of the
            // accessible name, and the current language is worth announcing.
            aria-label={`${t("language")}: ${LABEL[locale]}`}
          >
            <Languages aria-hidden="true" />
            <span className="hidden sm:inline">{LABEL[locale]}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {locales.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => switchTo(item)}
            disabled={item === locale}
          >
            {LABEL[item]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

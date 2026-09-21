"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";

export function AdminPage({
  title,
  action,
  keyword,
  onKeywordChange,
  children,
}: {
  title: string;
  action?: ReactNode;
  keyword?: string;
  onKeywordChange?: (keyword: string) => void;
  children: ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
        {action}
      </div>

      {onKeywordChange ? (
        <div className="relative max-w-sm">
          <label htmlFor="admin-search" className="sr-only">
            {t("search")}
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="admin-search"
            className="pl-8"
            value={keyword ?? ""}
            placeholder={t("search")}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
        </div>
      ) : null}

      {children}
    </div>
  );
}

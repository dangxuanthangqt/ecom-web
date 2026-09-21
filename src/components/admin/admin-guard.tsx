"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { RowsSkeleton } from "@/components/common/states";
import { useSession } from "@/components/providers/session-provider";
import { canAccessAdmin, canSee, type AdminSection } from "@/lib/auth/permissions";

/**
 * The API enforces permissions on every call; this only stops the UI from
 * rendering a page whose every request is going to come back 403.
 */
export function AdminGuard({
  section,
  children,
}: {
  section?: AdminSection;
  children: ReactNode;
}) {
  const t = useTranslations("admin");
  const { profile, isLoading } = useSession();

  if (isLoading) return <RowsSkeleton rows={6} />;

  const allowed = section ? canSee(profile, section) : canAccessAdmin(profile);

  if (!allowed) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm"
      >
        {t("noPermission")}
      </div>
    );
  }

  return <>{children}</>;
}

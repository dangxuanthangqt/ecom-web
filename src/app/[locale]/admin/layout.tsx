import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { UserMenu } from "@/components/storefront/user-menu";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-1 border-b border-border bg-card px-4">
          <LocaleSwitcher />
          <UserMenu />
        </header>

        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

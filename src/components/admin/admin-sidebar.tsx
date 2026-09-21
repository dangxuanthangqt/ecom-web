"use client";

import {
  Boxes,
  FolderTree,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  Languages as LanguagesIcon,
  Package,
  ShieldCheck,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

import { useSession } from "@/components/providers/session-provider";
import { Link, usePathname } from "@/i18n/navigation";
import { canSee, type AdminSection } from "@/lib/auth/permissions";
import { cn } from "cn";

const ITEMS: Array<{
  href: string;
  section: AdminSection | null;
  labelKey: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}> = [
  { href: "/admin", section: null, labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/products", section: "products", labelKey: "products", icon: Package },
  { href: "/admin/brands", section: "brands", labelKey: "brands", icon: Tags },
  { href: "/admin/categories", section: "categories", labelKey: "categories", icon: FolderTree },
  { href: "/admin/translations", section: "translations", labelKey: "translations", icon: LanguagesIcon },
  { href: "/admin/languages", section: "languages", labelKey: "languages", icon: LanguagesIcon },
  { href: "/admin/orders", section: "orders", labelKey: "orders", icon: Boxes },
  { href: "/admin/users", section: "users", labelKey: "users", icon: Users },
  { href: "/admin/roles", section: "roles", labelKey: "roles", icon: ShieldCheck },
  { href: "/admin/permissions", section: "permissions", labelKey: "permissions", icon: KeyRound },
  { href: "/admin/media", section: "media", labelKey: "media.title", icon: ImageIcon },
];

export function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const { profile } = useSession();

  return (
    <nav
      aria-label={t("title")}
      className="flex gap-1 overflow-x-auto border-b border-sidebar-border bg-sidebar p-2 lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-3"
    >
      <p className="hidden px-3 py-2 font-heading text-lg font-bold lg:block">
        {t("title")}
      </p>

      {ITEMS.filter(
        (item) => item.section === null || canSee(profile, item.section),
      ).map(({ href, labelKey, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden={true} />
            {t(labelKey)}
          </Link>
        );
      })}

      <Link
        href="/"
        className="mt-auto flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Store className="size-4" aria-hidden={true} />
        {t("backToStore")}
      </Link>
    </nav>
  );
}

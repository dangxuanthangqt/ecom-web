import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <p className="font-heading text-lg font-bold">
            {t("common.appName")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("home.heroSubtitle")}
          </p>
        </div>

        <nav className="space-y-2 text-sm">
          <p className="font-semibold">{t("nav.products")}</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/products">
            {t("home.browseAll")}
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/cart">
            {t("nav.cart")}
          </Link>
        </nav>

        <nav className="space-y-2 text-sm">
          <p className="font-semibold">{t("nav.account")}</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/orders">
            {t("nav.orders")}
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/account">
            {t("nav.profile")}
          </Link>
        </nav>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">{t("home.why")}</p>
          <p className="text-muted-foreground">{t("home.whySecureBody")}</p>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("common.appName")}
      </div>
    </footer>
  );
}

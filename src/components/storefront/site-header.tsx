"use client";

import { Menu, Search, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { CartBadge } from "@/components/storefront/cart-badge";
import { UserMenu } from "@/components/storefront/user-menu";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "cn";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/products", key: "products" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(
      keyword.trim()
        ? `/products?keyword=${encodeURIComponent(keyword.trim())}`
        : "/products",
    );
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("openMenu")}
              >
                <Menu aria-hidden="true" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>{tCommon("appName")}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {t(link.key)}
                </Link>
              ))}
              <Link
                href="/orders"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {t("orders")}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-bold"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Store className="size-4" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{tCommon("appName")}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href && "bg-accent text-accent-foreground",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <form onSubmit={search} className="ml-auto hidden max-w-xs flex-1 lg:block">
          <label htmlFor="site-search" className="sr-only">
            {tCommon("search")}
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="site-search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={tCommon("searchPlaceholder")}
              className="pl-8"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <LocaleSwitcher />
          <CartBadge />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

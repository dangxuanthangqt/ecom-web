"use client";

import { LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/components/providers/session-provider";
import { Link, useRouter } from "@/i18n/navigation";
import { canAccessAdmin } from "@/lib/auth/permissions";

export function UserMenu() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const { profile, isAuthenticated } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/login" />}>
          {t("login")}
        </Button>
        <Button
          variant="cta"
          size="sm"
          className="hidden sm:inline-flex"
          render={<Link href="/register" />}
        >
          {t("register")}
        </Button>
      </div>
    );
  }

  const signOut = async () => {
    setSigningOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      queryClient.clear();
      toast.success(tAuth("loggedOut"));
      router.replace("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            // WCAG 2.5.3: the name on screen has to be part of the accessible
            // name, otherwise voice control cannot target this button.
            aria-label={`${t("account")}: ${profile.name}`}
          >
            <User aria-hidden="true" />
            <span className="hidden max-w-28 truncate md:inline">
              {profile.name}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        {/* Base UI requires a group around a group label. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {profile.email}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account" />}>
          <User aria-hidden="true" />
          {t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/orders" />}>
          <Package aria-hidden="true" />
          {t("orders")}
        </DropdownMenuItem>
        {canAccessAdmin(profile) ? (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <LayoutDashboard aria-hidden="true" />
            {t("admin")}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={signingOut} onClick={() => void signOut()}>
          <LogOut aria-hidden="true" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

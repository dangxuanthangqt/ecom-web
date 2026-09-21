"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  pending,
  submitLabel,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  pending?: boolean;
  submitLabel?: string;
  children: ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <div className="space-y-4">{children}</div>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  {t("cancel")}
                </Button>
              }
            />
            <Button type="submit" variant="cta" disabled={pending}>
              {submitLabel ?? t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

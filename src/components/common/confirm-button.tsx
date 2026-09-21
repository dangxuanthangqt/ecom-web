"use client";

import { useState, type ReactElement } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

export function ConfirmButton({
  title,
  description,
  confirmLabel,
  onConfirm,
  trigger,
  pending,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  onConfirm: () => Promise<unknown> | void;
  trigger: ReactElement;
  pending?: boolean;
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">{t("cancel")}</Button>} />
          <Button
            variant="destructive"
            disabled={pending}
            onClick={async () => {
              await onConfirm();
              setOpen(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

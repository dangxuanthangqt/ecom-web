"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConfirmButton } from "@/components/common/confirm-button";
import { Button } from "@/components/ui/button";

/** Edit + delete, the trailing cell of every admin table. */
export function RowActions({
  onEdit,
  onDelete,
  deleteTitle,
  deleteDisabled,
  pending,
}: {
  onEdit: () => void;
  onDelete: () => Promise<unknown> | void;
  deleteTitle: string;
  deleteDisabled?: boolean;
  pending?: boolean;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("edit")}
        onClick={onEdit}
      >
        <Pencil aria-hidden="true" />
      </Button>

      <ConfirmButton
        title={deleteTitle}
        confirmLabel={t("delete")}
        pending={pending}
        onConfirm={onDelete}
        trigger={
          <Button
            variant="destructive"
            size="icon-sm"
            disabled={deleteDisabled}
            aria-label={t("delete")}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        }
      />
    </div>
  );
}

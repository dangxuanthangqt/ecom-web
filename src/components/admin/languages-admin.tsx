"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage } from "@/components/admin/admin-page";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { Field } from "@/components/common/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteLanguage,
  useLanguages,
  useSaveLanguage,
} from "@/lib/api/hooks/use-catalog";
import type { Language } from "@/lib/api/types";
import { useApiErrors } from "@/lib/api/use-error-toast";

export function LanguagesAdmin() {
  const t = useTranslations("admin.language");
  const tTable = useTranslations("admin.table");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const { data, isPending } = useLanguages();
  const saveLanguage = useSaveLanguage();
  const deleteLanguage = useDeleteLanguage();
  const { errors, report, reset } = useApiErrors();

  const [editing, setEditing] = useState<Language | null>(null);
  const [open, setOpen] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));

    try {
      await saveLanguage.mutateAsync({
        id: editing?.id,
        // The code is the primary key, so it is only settable on create.
        body: editing ? { name } : { id: String(form.get("id")), name },
      });
      toast.success(t("saved"));
      setOpen(false);
      setEditing(null);
    } catch (error) {
      report(error);
    }
  };

  const columns: Array<Column<Language>> = [
    {
      key: "id",
      header: t("code"),
      cell: (row) => <span className="font-mono text-sm">{row.id}</span>,
    },
    { key: "name", header: tTable("name"), cell: (row) => row.name },
    {
      key: "actions",
      header: tCommon("actions"),
      className: "text-right",
      cell: (row) => (
        <RowActions
          onEdit={() => {
            setEditing(row);
            setOpen(true);
          }}
          deleteTitle={t("deleteConfirm")}
          pending={deleteLanguage.isPending}
          onDelete={async () => {
            try {
              await deleteLanguage.mutateAsync(row.id);
              toast.success(t("deleted"));
            } catch (error) {
              report(error);
            }
          }}
        />
      ),
    },
  ];

  return (
    <AdminPage
      title={tAdmin("languages")}
      action={
        <Button
          variant="cta"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          {t("create")}
        </Button>
      }
    >
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        isPending={isPending}
      />

      <FormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        title={editing ? t("edit") : t("create")}
        pending={saveLanguage.isPending}
        onSubmit={submit}
      >
        {editing ? null : (
          <Field id="id" label={t("code")} error={errors.id} required>
            <Input id="id" name="id" maxLength={10} required placeholder="vn" />
          </Field>
        )}

        <Field id="name" label={tTable("name")} error={errors.name} required>
          <Input id="name" name="name" defaultValue={editing?.name} required />
        </Field>
      </FormDialog>
    </AdminPage>
  );
}

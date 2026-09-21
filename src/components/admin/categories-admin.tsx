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
import { NativeSelect } from "@/components/common/native-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCategories,
  useDeleteCategory,
  useSaveCategory,
} from "@/lib/api/hooks/use-catalog";
import type { CategoryWithChildren } from "@/lib/api/types";
import { useApiErrors } from "@/lib/api/use-error-toast";

export function CategoriesAdmin() {
  const t = useTranslations("admin.category");
  const tTable = useTranslations("admin.table");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const { data, isPending } = useCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();
  const { errors, report, reset } = useApiErrors();

  const [editing, setEditing] = useState<CategoryWithChildren | null>(null);
  const [open, setOpen] = useState(false);

  const categories = data?.data ?? [];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const form = new FormData(event.currentTarget);
    const parentCategoryId = String(form.get("parentCategoryId") || "");
    const logo = String(form.get("logo") || "");

    try {
      await saveCategory.mutateAsync({
        id: editing?.id,
        body: {
          name: String(form.get("name")),
          logo: logo || undefined,
          parentCategoryId: parentCategoryId || undefined,
        },
      });
      toast.success(t("saved"));
      setOpen(false);
      setEditing(null);
    } catch (error) {
      report(error);
    }
  };

  const columns: Array<Column<CategoryWithChildren>> = [
    { key: "name", header: tTable("name"), cell: (row) => row.name },
    {
      key: "parent",
      header: t("parent"),
      cell: (row) => row.parentCategory?.name ?? tCommon("none"),
    },
    {
      key: "children",
      header: tAdmin("categories"),
      cell: (row) => row.childrenCategories?.length ?? 0,
    },
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
          pending={deleteCategory.isPending}
          onDelete={async () => {
            try {
              await deleteCategory.mutateAsync(row.id);
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
      title={tAdmin("categories")}
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
      <DataTable columns={columns} rows={categories} isPending={isPending} />

      <FormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        title={editing ? t("edit") : t("create")}
        pending={saveCategory.isPending}
        onSubmit={submit}
      >
        <Field id="name" label={tTable("name")} error={errors.name} required>
          <Input id="name" name="name" defaultValue={editing?.name} required />
        </Field>

        <Field id="logo" label={tTable("logo")} error={errors.logo}>
          <Input
            id="logo"
            name="logo"
            type="url"
            defaultValue={
              typeof editing?.logo === "string" ? editing.logo : undefined
            }
          />
        </Field>

        <Field
          id="parentCategoryId"
          label={t("parent")}
          error={errors.parentCategoryId}
        >
          <NativeSelect
            id="parentCategoryId"
            name="parentCategoryId"
            placeholder={tCommon("none")}
            defaultValue={editing?.parentCategory?.id ?? ""}
            options={categories
              .filter((category) => category.id !== editing?.id)
              .map((category) => ({
                value: category.id,
                label: category.name,
              }))}
          />
        </Field>
      </FormDialog>
    </AdminPage>
  );
}

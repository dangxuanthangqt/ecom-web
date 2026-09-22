"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage } from "@/components/admin/admin-page";
import { DataTable, type Column } from "@/components/admin/data-table";
import { TranslationFormDialog } from "@/components/admin/translation-form-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { PaginationBar } from "@/components/common/pagination-bar";
import { Button } from "@/components/ui/button";
import { useBrands, useCategories, useLanguages } from "@/lib/api/hooks/use-catalog";
import { useManagedProducts } from "@/lib/api/hooks/use-products";
import {
  useDeleteTranslation,
  useSaveTranslation,
  useTranslations as useTranslationRows,
  type Translation,
  type TranslationKind,
} from "@/lib/api/hooks/use-translations";
import { TARGET_FIELD } from "@/components/admin/translation-form-dialog";
import { useApiErrors } from "@/lib/api/use-error-toast";
import { cn } from "cn";

export function TranslationsAdmin() {
  const t = useTranslations("admin.translation");
  const tTable = useTranslations("admin.table");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [kind, setKind] = useState<TranslationKind>("brand");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<Translation | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isPending } = useTranslationRows(kind, {
    page,
    pageSize,
    keyword: keyword || undefined,
  });
  const { data: languages } = useLanguages();
  const { data: brands } = useBrands({ page: 1, pageSize: 100 });
  const { data: categories } = useCategories();
  const { data: products } = useManagedProducts({ page: 1, pageSize: 100 });

  const saveTranslation = useSaveTranslation(kind);
  const deleteTranslation = useDeleteTranslation(kind);
  const { errors, report, reset } = useApiErrors();

  const targetOptions =
    kind === "brand"
      ? (brands?.data ?? []).map((item) => ({ value: item.id, label: item.name }))
      : kind === "category"
        ? (categories?.data ?? []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        : (products?.data ?? []).map((item) => ({
            value: item.id,
            label: item.name,
          }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const form = new FormData(event.currentTarget);
    const shared = {
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      languageId: String(form.get("languageId")),
    };

    try {
      await saveTranslation.mutateAsync({
        id: editing?.id,
        body: editing
          ? shared
          : {
              ...shared,
              [TARGET_FIELD[kind]]: String(form.get("targetId")),
            },
      });
      toast.success(t("saved"));
      setOpen(false);
      setEditing(null);
    } catch (error) {
      report(error);
    }
  };

  const columns: Array<Column<Translation>> = [
    { key: "name", header: tTable("name"), cell: (row) => row.name },
    {
      key: "language",
      header: t("language"),
      cell: (row) => (
        <span className="font-mono text-xs">{row.language?.id}</span>
      ),
    },
    {
      key: "description",
      header: t("description"),
      cell: (row) => (
        <span className="line-clamp-2 text-muted-foreground">
          {row.description}
        </span>
      ),
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
          pending={deleteTranslation.isPending}
          onDelete={async () => {
            try {
              await deleteTranslation.mutateAsync(row.id);
              toast.success(t("deleted"));
            } catch (error) {
              report(error);
            }
          }}
        />
      ),
    },
  ];

  const tabs: Array<{ value: TranslationKind; label: string }> = [
    { value: "brand", label: t("brandTab") },
    { value: "category", label: t("categoryTab") },
    { value: "product", label: t("productTab") },
  ];

  return (
    <AdminPage
      title={tAdmin("translations")}
      keyword={keyword}
      onKeywordChange={(value) => {
        setKeyword(value);
        setPage(1);
      }}
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
      <div role="tablist" className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={kind === tab.value}
            onClick={() => {
              setKind(tab.value);
              setPage(1);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              kind === tab.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        isPending={isPending}
      />

      {data ? (
        <PaginationBar
          page={data.pagination.page}
          pageSize={data.pagination.pageSize}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : null}

      <TranslationFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        editing={editing}
        kind={kind}
        targetOptions={targetOptions}
        languages={languages?.data ?? []}
        errors={errors}
        pending={saveTranslation.isPending}
        onSubmit={submit}
      />
    </AdminPage>
  );
}

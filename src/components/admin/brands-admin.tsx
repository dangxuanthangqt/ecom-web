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
import { PaginationBar } from "@/components/common/pagination-bar";
import { RemoteImage } from "@/components/common/remote-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useBrands,
  useDeleteBrand,
  useSaveBrand,
} from "@/lib/api/hooks/use-catalog";
import type { BrandWithTranslations } from "@/lib/api/types";
import { useApiErrors } from "@/lib/api/use-error-toast";
import { shortId } from "@/lib/format";

export function BrandsAdmin() {
  const t = useTranslations("admin.brand");
  const tTable = useTranslations("admin.table");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<BrandWithTranslations | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isPending } = useBrands({
    pageIndex,
    pageSize,
    keyword: keyword || undefined,
  });
  const saveBrand = useSaveBrand();
  const deleteBrand = useDeleteBrand();
  const { errors, report, reset } = useApiErrors();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const form = new FormData(event.currentTarget);

    try {
      await saveBrand.mutateAsync({
        id: editing?.id,
        body: {
          name: String(form.get("name")),
          logo: String(form.get("logo")),
        },
      });
      toast.success(t("saved"));
      setOpen(false);
      setEditing(null);
    } catch (error) {
      report(error);
    }
  };

  const columns: Array<Column<BrandWithTranslations>> = [
    {
      key: "logo",
      header: tTable("logo"),
      cell: (row) => (
        <RemoteImage
          src={row.logo}
          alt={row.name}
          sizes="40px"
          className="size-10"
        />
      ),
    },
    { key: "name", header: tTable("name"), cell: (row) => row.name },
    {
      key: "id",
      header: tTable("id"),
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {shortId(row.id)}
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
          pending={deleteBrand.isPending}
          onDelete={async () => {
            try {
              await deleteBrand.mutateAsync(row.id);
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
      title={tAdmin("brands")}
      keyword={keyword}
      onKeywordChange={(value) => {
        setKeyword(value);
        setPageIndex(0);
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
      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        isPending={isPending}
      />

      {data ? (
        <PaginationBar
          pageIndex={data.pagination.pageIndex}
          pageSize={data.pagination.pageSize}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.totalItems}
          onPageChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
        />
      ) : null}

      <FormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditing(null);
        }}
        title={editing ? t("edit") : t("create")}
        pending={saveBrand.isPending}
        onSubmit={submit}
      >
        <Field id="name" label={tTable("name")} error={errors.name} required>
          <Input id="name" name="name" defaultValue={editing?.name} required />
        </Field>

        <Field id="logo" label={tTable("logo")} error={errors.logo} required>
          <Input
            id="logo"
            name="logo"
            type="url"
            defaultValue={editing?.logo}
            required
          />
        </Field>
      </FormDialog>
    </AdminPage>
  );
}

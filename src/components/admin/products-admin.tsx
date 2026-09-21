"use client";

import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminPage } from "@/components/admin/admin-page";
import { DataTable, type Column } from "@/components/admin/data-table";
import { RowActions } from "@/components/admin/row-actions";
import {
  ProductFormDialog,
  type ProductDraft,
} from "@/components/admin/product-form-dialog";
import { PaginationBar } from "@/components/common/pagination-bar";
import { RemoteImage } from "@/components/common/remote-image";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { useBrands, useCategories } from "@/lib/api/hooks/use-catalog";
import {
  useDeleteProduct,
  useManagedProduct,
  useManagedProducts,
  useSaveProduct,
} from "@/lib/api/hooks/use-products";
import type { Product } from "@/lib/api/types";
import { useApiErrors } from "@/lib/api/use-error-toast";
import { formatPrice } from "@/lib/format";

const EMPTY_DRAFT: ProductDraft = { variants: [], skus: [], categoryIds: [] };

export function ProductsAdmin() {
  const t = useTranslations("admin.product");
  const tTable = useTranslations("admin.table");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const { data, isPending } = useManagedProducts({
    pageIndex,
    pageSize,
    keyword: keyword || undefined,
  });
  const { data: editing } = useManagedProduct(editingId ?? undefined);
  const { data: brands } = useBrands({ pageIndex: 0, pageSize: 100 });
  const { data: categories } = useCategories();

  const saveProduct = useSaveProduct();
  const deleteProduct = useDeleteProduct();
  const { errors, report, reset } = useApiErrors();

  // The list row carries no variants or SKUs, so the draft is seeded once the
  // full record arrives from `/manage-product/products/{id}`.
  useEffect(() => {
    if (!editing) return;

    setDraft({
      variants: (editing.variants ?? []).map((variant) => ({
        value: variant.value,
        options: variant.options.join(", "),
      })),
      skus: (editing.skus ?? []).map((sku) => ({
        value: sku.value,
        price: String(sku.price),
        stock: String(sku.stock),
        image: sku.image ?? "",
      })),
      categoryIds: (editing.categories ?? []).map((category) => category.id),
    });
  }, [editing]);

  const openDialog = (id?: string) => {
    reset();
    setEditingId(id ?? null);
    if (!id) setDraft(EMPTY_DRAFT);
    setOpen(true);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const form = new FormData(event.currentTarget);
    const publishedAt = String(form.get("publishedAt") || "");

    try {
      await saveProduct.mutateAsync({
        id: editingId ?? undefined,
        body: {
          name: String(form.get("name")),
          basePrice: Number(form.get("basePrice")),
          virtualPrice: Number(form.get("virtualPrice")),
          brandId: String(form.get("brandId")),
          images: String(form.get("images"))
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          categoryIds: draft.categoryIds,
          variants: draft.variants.map((variant) => ({
            value: variant.value,
            options: variant.options
              .split(",")
              .map((option) => option.trim())
              .filter(Boolean),
          })),
          skus: draft.skus.map((sku) => ({
            value: sku.value,
            price: Number(sku.price),
            stock: Number(sku.stock),
            image: sku.image,
          })),
          // The generated request type marks publishedAt as required, so an
          // empty field publishes now rather than sending nothing.
          publishedAt: new Date(publishedAt || Date.now()).toISOString(),
        },
      });
      toast.success(t("saved"));
      setOpen(false);
      setEditingId(null);
    } catch (error) {
      report(error);
    }
  };

  const columns: Array<Column<Product>> = [
    {
      key: "image",
      header: tTable("image"),
      cell: (row) => (
        <RemoteImage
          src={row.images?.[0]}
          // Decorative here: the name sits in the very next cell, so repeating
          // it would just make a screen reader say everything twice.
          alt=""
          sizes="40px"
          className="size-10"
        />
      ),
    },
    { key: "name", header: tTable("name"), cell: (row) => row.name },
    {
      key: "brand",
      header: t("brand"),
      cell: (row) => row.brand?.name ?? tCommon("none"),
    },
    {
      key: "price",
      header: tTable("price"),
      cell: (row) => formatPrice(row.basePrice, locale),
    },
    {
      key: "actions",
      header: tCommon("actions"),
      className: "text-right",
      cell: (row) => (
        <RowActions
          onEdit={() => openDialog(row.id)}
          deleteTitle={t("deleteConfirm")}
          pending={deleteProduct.isPending}
          onDelete={async () => {
            try {
              await deleteProduct.mutateAsync(row.id);
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
      title={tAdmin("products")}
      keyword={keyword}
      onKeywordChange={(value) => {
        setKeyword(value);
        setPageIndex(0);
      }}
      action={
        <Button variant="cta" onClick={() => openDialog()}>
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

      <ProductFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditingId(null);
        }}
        editing={editing}
        isEditing={Boolean(editingId)}
        draft={draft}
        setDraft={setDraft}
        brands={brands?.data ?? []}
        categories={categories?.data ?? []}
        errors={errors}
        pending={saveProduct.isPending}
        onSubmit={submit}
      />
    </AdminPage>
  );
}

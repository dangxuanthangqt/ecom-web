"use client";

import { useTranslations } from "next-intl";
import type { Dispatch, SetStateAction } from "react";

import { FormDialog } from "@/components/admin/form-dialog";
import {
  SkuEditor,
  VariantEditor,
  type SkuDraft,
  type VariantDraft,
} from "@/components/admin/product-form-fields";
import { Field } from "@/components/common/field";
import { NativeSelect } from "@/components/common/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  BrandWithTranslations,
  CategoryWithChildren,
  ProductDetail,
} from "@/lib/api/types";

export type ProductDraft = {
  variants: VariantDraft[];
  skus: SkuDraft[];
  categoryIds: string[];
};

/**
 * `publishedAt` is typed as an opaque object by the generated schema, but the
 * API sends an ISO string. Narrow it here rather than lying about the type.
 */
function publishedAtInputValue(value: unknown) {
  return typeof value === "string" ? value.slice(0, 16) : "";
}

export function ProductFormDialog({
  open,
  onOpenChange,
  editing,
  isEditing,
  draft,
  setDraft,
  brands,
  categories,
  errors,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: ProductDetail;
  isEditing: boolean;
  draft: ProductDraft;
  setDraft: Dispatch<SetStateAction<ProductDraft>>;
  brands: BrandWithTranslations[];
  categories: CategoryWithChildren[];
  errors: Record<string, string>;
  pending: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const t = useTranslations("admin.product");
  const tTable = useTranslations("admin.table");
  const tCommon = useTranslations("common");

  return (
  <FormDialog
    open={open}
    onOpenChange={onOpenChange}
    title={isEditing ? t("edit") : t("create")}
    pending={pending}
    onSubmit={onSubmit}
  >
    <Field id="name" label={tTable("name")} error={errors.name} required>
      <Input
        id="name"
        name="name"
        key={editing?.id ?? "new"}
        defaultValue={editing?.name}
        required
      />
    </Field>

    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        id="basePrice"
        label={t("basePrice")}
        error={errors.basePrice}
        required
      >
        <Input
          id="basePrice"
          name="basePrice"
          type="number"
          min={0}
          step="0.01"
          key={`${editing?.id ?? "new"}-base`}
          defaultValue={editing?.basePrice ?? 0}
          required
        />
      </Field>

      <Field
        id="virtualPrice"
        label={t("virtualPrice")}
        error={errors.virtualPrice}
        required
      >
        <Input
          id="virtualPrice"
          name="virtualPrice"
          type="number"
          min={0}
          step="0.01"
          key={`${editing?.id ?? "new"}-virtual`}
          defaultValue={editing?.virtualPrice ?? 0}
          required
        />
      </Field>
    </div>

    <Field id="brandId" label={t("brand")} error={errors.brandId} required>
      <NativeSelect
        id="brandId"
        name="brandId"
        required
        placeholder={tCommon("none")}
        key={`${editing?.id ?? "new"}-brand`}
        defaultValue={editing?.brand?.id ?? ""}
        options={brands.map((brand) => ({
          value: brand.id,
          label: brand.name,
        }))}
      />
    </Field>

    <Field id="images" label={t("images")} error={errors.images} required>
      <Textarea
        id="images"
        name="images"
        rows={3}
        placeholder="https://…"
        key={`${editing?.id ?? "new"}-images`}
        defaultValue={(editing?.images ?? []).join("\n")}
        required
      />
    </Field>

    <Field id="publishedAt" label={t("publishedAt")} error={errors.publishedAt}>
      <Input
        id="publishedAt"
        name="publishedAt"
        type="datetime-local"
        key={`${editing?.id ?? "new"}-published`}
        defaultValue={publishedAtInputValue(editing?.publishedAt)}
      />
    </Field>

    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{t("categories")}</legend>
      <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-border p-3">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center gap-2">
            <Checkbox
              id={`product-category-${category.id}`}
              checked={draft.categoryIds.includes(category.id)}
              onCheckedChange={() =>
                setDraft((previous) => ({
                  ...previous,
                  categoryIds: previous.categoryIds.includes(category.id)
                    ? previous.categoryIds.filter(
                        (id) => id !== category.id,
                      )
                    : [...previous.categoryIds, category.id],
                }))
              }
            />
            <Label
              htmlFor={`product-category-${category.id}`}
              className="font-normal"
            >
              {category.name}
            </Label>
          </li>
        ))}
      </ul>
    </fieldset>

    <VariantEditor
      variants={draft.variants}
      onChange={(variants) =>
        setDraft((previous) => ({ ...previous, variants }))
      }
    />

    <SkuEditor
      skus={draft.skus}
      variants={draft.variants}
      onChange={(skus) => setDraft((previous) => ({ ...previous, skus }))}
    />
  </FormDialog>
  );
}

"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { NativeSelect } from "@/components/common/native-select";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrands, useCategories } from "@/lib/api/hooks/use-catalog";
import type { ProductQuery, ProductSortField, SortOrder } from "@/lib/api/types";
import { hasPermission } from "@/lib/auth/permissions";

const SORT_FIELDS: ProductSortField[] = [
  "createdAt",
  "name",
  "basePrice",
  "publishedAt",
  "updatedAt",
  "virtualPrice",
  "sale",
];

export function ProductFilters({
  value,
  onChange,
  onReset,
}: {
  value: ProductQuery;
  onChange: (patch: Partial<ProductQuery>) => void;
  onReset: () => void;
}) {
  const t = useTranslations("products");
  const { profile } = useSession();
  const { data: brands } = useBrands({ page: 1, pageSize: 100 });
  // `/categories` needs `category:read:any` on this API — a plain shopper gets
  // a 403 — so the filter is gated on the permission, not on merely being
  // signed in, and the request only fires for someone who may make it.
  const canReadCategories = hasPermission(profile, "category:read:any");
  const { data: categories } = useCategories(undefined, canReadCategories);
  const [open, setOpen] = useState(false);

  const toggle = (key: "brandIds" | "categoryIds", id: string) => {
    const current = value[key] ?? [];

    onChange({
      [key]: current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
      page: 1,
    });
  };

  return (
    <aside className="lg:w-64 lg:shrink-0">
      <Button
        variant="outline"
        className="mb-3 w-full lg:hidden"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
      >
        {open ? <X aria-hidden="true" /> : <SlidersHorizontal aria-hidden="true" />}
        {t("filters")}
      </Button>

      <div
        className={`${open ? "block" : "hidden"} space-y-6 rounded-xl border border-border bg-card p-4 lg:block`}
      >
        <div className="space-y-2">
          <Label htmlFor="sort-by">{t("sortBy")}</Label>
          <NativeSelect
            id="sort-by"
            value={value.orderBy ?? "createdAt"}
            onChange={(event) =>
              onChange({
                orderBy: event.target.value as ProductSortField,
                page: 1,
              })
            }
            options={SORT_FIELDS.map((field) => ({
              value: field,
              label: t(`sort.${field}`),
            }))}
          />
          <NativeSelect
            aria-label={t("sortDirection")}
            value={value.order ?? "desc"}
            onChange={(event) =>
              onChange({
                order: event.target.value as SortOrder,
                page: 1,
              })
            }
            options={[
              { value: "desc", label: t("order.desc") },
              { value: "asc", label: t("order.asc") },
            ]}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{t("priceRange")}</legend>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              inputMode="decimal"
              aria-label={t("minPrice")}
              placeholder={t("minPrice")}
              value={value.minPrice ?? ""}
              onChange={(event) =>
                onChange({
                  minPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                  page: 1,
                })
              }
            />
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <Input
              type="number"
              min={0}
              inputMode="decimal"
              aria-label={t("maxPrice")}
              placeholder={t("maxPrice")}
              value={value.maxPrice ?? ""}
              onChange={(event) =>
                onChange({
                  maxPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                  page: 1,
                })
              }
            />
          </div>
        </fieldset>

        {brands?.data.length ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">{t("brand")}</legend>
            <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {brands.data.map((brand) => (
                <li key={brand.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={(value.brandIds ?? []).includes(brand.id)}
                    onCheckedChange={() => toggle("brandIds", brand.id)}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="font-normal">
                    {brand.name}
                  </Label>
                </li>
              ))}
            </ul>
          </fieldset>
        ) : null}

        {canReadCategories && categories?.data.length ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">{t("category")}</legend>
            <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {categories.data.map((category) => (
                <li key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={(value.categoryIds ?? []).includes(category.id)}
                    onCheckedChange={() => toggle("categoryIds", category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="font-normal"
                  >
                    {category.name}
                  </Label>
                </li>
              ))}
            </ul>
          </fieldset>
        ) : null}

        <Button variant="ghost" className="w-full" onClick={onReset}>
          {t("clearFilters")}
        </Button>
      </div>
    </aside>
  );
}

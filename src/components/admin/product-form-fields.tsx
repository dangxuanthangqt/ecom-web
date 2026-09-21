"use client";

import { Plus, Trash2, Wand2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Field } from "@/components/common/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type VariantDraft = { value: string; options: string };
export type SkuDraft = {
  value: string;
  price: string;
  stock: string;
  image: string;
};

/** Every combination of every variant's options, joined the way SKUs read. */
export function buildSkuValues(variants: VariantDraft[]): string[] {
  const groups = variants
    .map((variant) =>
      variant.options
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean),
    )
    .filter((options) => options.length > 0);

  if (groups.length === 0) return [];

  return groups.reduce<string[]>(
    (combinations, options) =>
      combinations.flatMap((prefix) =>
        options.map((option) => (prefix ? `${prefix}-${option}` : option)),
      ),
    [""],
  );
}

export function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}) {
  const t = useTranslations("admin.product");

  const update = (index: number, patch: Partial<VariantDraft>) =>
    onChange(
      variants.map((variant, current) =>
        current === index ? { ...variant, ...patch } : variant,
      ),
    );

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{t("variants")}</legend>

      {variants.map((variant, index) => (
        <div key={index} className="flex items-end gap-2">
          <Field
            id={`variant-name-${index}`}
            label={t("variantName")}
            className="flex-1"
          >
            <Input
              id={`variant-name-${index}`}
              value={variant.value}
              onChange={(event) => update(index, { value: event.target.value })}
            />
          </Field>

          <Field
            id={`variant-options-${index}`}
            label={t("variantOptions")}
            className="flex-1"
          >
            <Input
              id={`variant-options-${index}`}
              value={variant.options}
              onChange={(event) =>
                update(index, { options: event.target.value })
              }
            />
          </Field>

          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            aria-label={t("variants")}
            onClick={() =>
              onChange(variants.filter((_, current) => current !== index))
            }
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...variants, { value: "", options: "" }])}
      >
        <Plus aria-hidden="true" />
        {t("addVariant")}
      </Button>
    </fieldset>
  );
}

export function SkuEditor({
  skus,
  variants,
  onChange,
}: {
  skus: SkuDraft[];
  variants: VariantDraft[];
  onChange: (skus: SkuDraft[]) => void;
}) {
  const t = useTranslations("admin.product");

  const update = (index: number, patch: Partial<SkuDraft>) =>
    onChange(
      skus.map((sku, current) =>
        current === index ? { ...sku, ...patch } : sku,
      ),
    );

  const generate = () => {
    const values = buildSkuValues(variants);

    onChange(
      values.map(
        (value) =>
          skus.find((sku) => sku.value === value) ?? {
            value,
            price: "0",
            stock: "0",
            image: "",
          },
      ),
    );
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{t("skus")}</legend>

      <Button type="button" variant="outline" size="sm" onClick={generate}>
        <Wand2 aria-hidden="true" />
        {t("generateSkus")}
      </Button>

      {skus.map((sku, index) => (
        <div
          key={index}
          className="grid gap-2 rounded-lg border border-border p-2 sm:grid-cols-[1fr_6rem_6rem_1fr_auto]"
        >
          <Input
            aria-label={t("skuValue")}
            placeholder={t("skuValue")}
            value={sku.value}
            onChange={(event) => update(index, { value: event.target.value })}
          />
          <Input
            type="number"
            min={0}
            step="0.01"
            aria-label={t("basePrice")}
            value={sku.price}
            onChange={(event) => update(index, { price: event.target.value })}
          />
          <Input
            type="number"
            min={0}
            aria-label="stock"
            value={sku.stock}
            onChange={(event) => update(index, { stock: event.target.value })}
          />
          <Input
            type="url"
            aria-label="image"
            placeholder="https://…"
            value={sku.image}
            onChange={(event) => update(index, { image: event.target.value })}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            aria-label={t("skus")}
            onClick={() => onChange(skus.filter((_, i) => i !== index))}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...skus, { value: "", price: "0", stock: "0", image: "" }])
        }
      >
        <Plus aria-hidden="true" />
        {t("skus")}
      </Button>
    </fieldset>
  );
}

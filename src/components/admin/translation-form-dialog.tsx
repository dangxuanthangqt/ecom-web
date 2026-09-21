"use client";

import { useTranslations } from "next-intl";

import { FormDialog } from "@/components/admin/form-dialog";
import { Field } from "@/components/common/field";
import {
  NativeSelect,
  type SelectOption,
} from "@/components/common/native-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  Translation,
  TranslationKind,
} from "@/lib/api/hooks/use-translations";
import type { Language } from "@/lib/api/types";

/** `brandId` / `categoryId` / `productId` — the field name follows the kind. */
export const TARGET_FIELD: Record<TranslationKind, string> = {
  brand: "brandId",
  category: "categoryId",
  product: "productId",
};

export function TranslationFormDialog({
  open,
  onOpenChange,
  editing,
  kind,
  targetOptions,
  languages,
  errors,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Translation | null;
  kind: TranslationKind;
  targetOptions: SelectOption[];
  languages: Language[];
  errors: Record<string, string>;
  pending: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const t = useTranslations("admin.translation");
  const tTable = useTranslations("admin.table");
  const tCommon = useTranslations("common");

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? t("edit") : t("create")}
      pending={pending}
      onSubmit={onSubmit}
    >
      {editing ? null : (
        <Field
          id="targetId"
          label={t("target")}
          error={errors[TARGET_FIELD[kind]]}
          required
        >
          <NativeSelect
            id="targetId"
            name="targetId"
            required
            placeholder={tCommon("none")}
            options={targetOptions}
          />
        </Field>
      )}

      <Field
        id="languageId"
        label={t("language")}
        error={errors.languageId}
        required
      >
        <NativeSelect
          id="languageId"
          name="languageId"
          required
          defaultValue={editing?.language?.id ?? ""}
          placeholder={tCommon("none")}
          options={languages.map((language) => ({
            value: language.id,
            label: `${language.id} — ${language.name}`,
          }))}
        />
      </Field>

      <Field id="name" label={tTable("name")} error={errors.name} required>
        <Input
          id="name"
          name="name"
          key={editing?.id ?? "new"}
          defaultValue={editing?.name}
          required
        />
      </Field>

      <Field id="description" label={t("description")} error={errors.description}>
        <Textarea
          id="description"
          name="description"
          rows={4}
          key={`${editing?.id ?? "new"}-description`}
          defaultValue={editing?.description}
        />
      </Field>
    </FormDialog>
  );
}

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteRole,
  usePermissions,
  useRole,
  useRoles,
  useSaveRole,
} from "@/lib/api/hooks/use-admin";
import type { Role } from "@/lib/api/types";
import { useApiErrors } from "@/lib/api/use-error-toast";

export function RolesAdmin() {
  const t = useTranslations("admin.role");
  const tTable = useTranslations("admin.table");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const { data, isPending } = useRoles({
    page,
    pageSize,
    keyword: keyword || undefined,
  });
  // The list endpoint returns roles without their permissions, so the dialog
  // fetches the full record before it can pre-tick the boxes.
  const { data: editing } = useRole(editingId ?? undefined);
  const { data: permissions } = usePermissions({ page: 1, pageSize: 200 });
  const saveRole = useSaveRole();
  const deleteRole = useDeleteRole();
  const { errors, report, reset } = useApiErrors();

  const openDialog = (role?: Role) => {
    reset();
    setEditingId(role?.id ?? null);
    setIsActive(role?.isActive ?? true);
    setPermissionIds([]);
    setOpen(true);
  };

  const effectivePermissionIds =
    permissionIds.length > 0
      ? permissionIds
      : (editing?.permissions?.map((permission) => permission.id) ?? []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const form = new FormData(event.currentTarget);

    try {
      await saveRole.mutateAsync({
        id: editingId ?? undefined,
        body: {
          name: String(form.get("name")),
          description: String(form.get("description") || ""),
          isActive,
          permissionIds: effectivePermissionIds,
        },
      });
      toast.success(t("saved"));
      setOpen(false);
      setEditingId(null);
    } catch (error) {
      report(error);
    }
  };

  const columns: Array<Column<Role>> = [
    { key: "name", header: tTable("name"), cell: (row) => row.name },
    {
      key: "description",
      header: t("description"),
      cell: (row) => (
        <span className="text-muted-foreground">{row.description}</span>
      ),
    },
    {
      key: "flags",
      header: tTable("status"),
      cell: (row) => (
        <div className="flex gap-1">
          <Badge variant={row.isActive ? "secondary" : "outline"}>
            {row.isActive ? t("isActive") : tCommon("none")}
          </Badge>
          {row.isSystem ? <Badge variant="outline">{t("isSystem")}</Badge> : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: tCommon("actions"),
      className: "text-right",
      cell: (row) => (
        <RowActions
          onEdit={() => openDialog(row)}
          deleteTitle={row.isSystem ? t("systemLocked") : t("deleteConfirm")}
          deleteDisabled={row.isSystem}
          pending={deleteRole.isPending}
          onDelete={async () => {
            try {
              await deleteRole.mutateAsync(row.id);
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
      title={tAdmin("roles")}
      keyword={keyword}
      onKeywordChange={(value) => {
        setKeyword(value);
        setPage(1);
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

      <FormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setEditingId(null);
        }}
        title={editingId ? t("edit") : t("create")}
        pending={saveRole.isPending}
        onSubmit={submit}
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

        <Field
          id="description"
          label={t("description")}
          error={errors.description}
        >
          <Textarea
            id="description"
            name="description"
            rows={2}
            key={`${editing?.id ?? "new"}-description`}
            defaultValue={editing?.description ?? ""}
          />
        </Field>

        <div className="flex items-center gap-2">
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
          <Label htmlFor="isActive">{t("isActive")}</Label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{t("permissions")}</legend>
          <ul className="max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-border p-3">
            {(permissions?.data ?? []).map((permission) => (
              <li key={permission.id} className="flex items-center gap-2">
                <Checkbox
                  id={`permission-${permission.id}`}
                  checked={effectivePermissionIds.includes(permission.id)}
                  onCheckedChange={() =>
                    setPermissionIds(
                      effectivePermissionIds.includes(permission.id)
                        ? effectivePermissionIds.filter(
                            (id) => id !== permission.id,
                          )
                        : [...effectivePermissionIds, permission.id],
                    )
                  }
                />
                <Label
                  htmlFor={`permission-${permission.id}`}
                  className="font-mono text-xs font-normal"
                >
                  {permission.key}
                </Label>
              </li>
            ))}
          </ul>
        </fieldset>
      </FormDialog>
    </AdminPage>
  );
}

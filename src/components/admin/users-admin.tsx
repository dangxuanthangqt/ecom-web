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
import { PaginationBar } from "@/components/common/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteUser,
  useRoles,
  useSaveUser,
  useUsers,
} from "@/lib/api/hooks/use-admin";
import type { UserItem, UserStatus } from "@/lib/api/types";
import { useApiErrors } from "@/lib/api/use-error-toast";

const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "BLOCKED"];

export function UsersAdmin() {
  const t = useTranslations("admin.user");
  const tTable = useTranslations("admin.table");
  const tAdmin = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isPending } = useUsers({
    pageIndex,
    pageSize,
    keyword: keyword || undefined,
  });
  const { data: roles } = useRoles({ pageIndex: 0, pageSize: 100 });
  const saveUser = useSaveUser();
  const deleteUser = useDeleteUser();
  const { errors, report, reset } = useApiErrors();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const avatar = String(form.get("avatar") || "");

    const shared = {
      name: String(form.get("name")),
      phoneNumber: String(form.get("phoneNumber")),
      status: String(form.get("status")) as UserStatus,
      roleId: String(form.get("roleId")) || undefined,
      avatar: avatar || undefined,
    };

    try {
      await saveUser.mutateAsync({
        id: editing?.id,
        body: editing
          ? { ...shared, ...(password ? { password } : {}) }
          : { ...shared, email: String(form.get("email")), password },
      });
      toast.success(t("saved"));
      setOpen(false);
      setEditing(null);
    } catch (error) {
      report(error);
    }
  };

  const columns: Array<Column<UserItem>> = [
    { key: "name", header: tTable("name"), cell: (row) => row.name },
    { key: "email", header: tTable("email"), cell: (row) => row.email },
    {
      key: "role",
      header: tTable("role"),
      cell: (row) => <Badge variant="secondary">{row.role?.name}</Badge>,
    },
    {
      key: "status",
      header: tTable("status"),
      cell: (row) => <Badge variant="outline">{row.status}</Badge>,
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
          pending={deleteUser.isPending}
          onDelete={async () => {
            try {
              await deleteUser.mutateAsync(row.id);
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
      title={tAdmin("users")}
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
        pending={saveUser.isPending}
        onSubmit={submit}
      >
        {editing ? null : (
          <Field id="email" label={tAuth("email")} error={errors.email} required>
            <Input id="email" name="email" type="email" required />
          </Field>
        )}

        <Field id="name" label={tAuth("name")} error={errors.name} required>
          <Input id="name" name="name" defaultValue={editing?.name} required />
        </Field>

        <Field
          id="phoneNumber"
          label={tAuth("phoneNumber")}
          error={errors.phoneNumber}
          required
        >
          <Input
            id="phoneNumber"
            name="phoneNumber"
            defaultValue={editing?.phoneNumber}
            required
          />
        </Field>

        <Field
          id="password"
          label={t("password")}
          error={errors.password}
          hint={editing ? tCommon("optional") : undefined}
          required={!editing}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required={!editing}
          />
        </Field>

        <Field id="avatar" label={tAuth("avatar")} error={errors.avatar}>
          <Input
            id="avatar"
            name="avatar"
            type="url"
            defaultValue={editing?.avatar ?? ""}
          />
        </Field>

        <Field id="roleId" label={tTable("role")} error={errors.roleId}>
          <NativeSelect
            id="roleId"
            name="roleId"
            placeholder={tCommon("none")}
            defaultValue={editing?.role?.id ?? ""}
            options={(roles?.data ?? []).map((role) => ({
              value: role.id,
              label: role.name,
            }))}
          />
        </Field>

        <Field id="status" label={tTable("status")} error={errors.status}>
          <NativeSelect
            id="status"
            name="status"
            defaultValue={editing?.status ?? "ACTIVE"}
            options={STATUSES.map((status) => ({
              value: status,
              label: status,
            }))}
          />
        </Field>
      </FormDialog>
    </AdminPage>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { AdminPage } from "@/components/admin/admin-page";
import { DataTable, type Column } from "@/components/admin/data-table";
import { PaginationBar } from "@/components/common/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/lib/api/hooks/use-admin";
import type { PermissionWithRoles } from "@/lib/api/types";

export function PermissionsAdmin() {
  const t = useTranslations("admin.permission");
  const tAdmin = useTranslations("admin");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [keyword, setKeyword] = useState("");

  const { data, isPending } = usePermissions({
    page,
    pageSize,
    keyword: keyword || undefined,
  });

  const columns: Array<Column<PermissionWithRoles>> = [
    {
      key: "key",
      header: t("key"),
      cell: (row) => <span className="font-mono text-xs">{row.key}</span>,
    },
    { key: "resource", header: t("resource"), cell: (row) => row.resource },
    { key: "action", header: t("action"), cell: (row) => row.action },
    { key: "scope", header: t("scope"), cell: (row) => row.scope },
    {
      key: "roles",
      header: t("roles"),
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.roles ?? []).map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.name}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <AdminPage
      title={tAdmin("permissions")}
      keyword={keyword}
      onKeywordChange={(value) => {
        setKeyword(value);
        setPage(1);
      }}
    >
      <p className="text-sm text-muted-foreground">{t("readOnly")}</p>

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
    </AdminPage>
  );
}

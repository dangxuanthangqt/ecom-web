"use client";

import { PaginationBar } from "@/components/common/pagination-bar";
import type { ListResponse } from "@/lib/api/http";

/** Same footer under every paginated admin list. */
export function ListPagination<T>({
  data,
  onPageChange,
  onPageSizeChange,
}: {
  data?: ListResponse<T>;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  if (!data) return null;

  return (
    <PaginationBar
      pageIndex={data.pagination.pageIndex}
      pageSize={data.pagination.pageSize}
      totalPages={data.pagination.totalPages}
      totalItems={data.pagination.totalItems}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}

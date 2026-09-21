"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { NativeSelect } from "@/components/common/native-select";
import { Button } from "@/components/ui/button";

const PAGE_SIZES = [10, 20, 50, 100];

export function PaginationBar({
  pageIndex,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  pageIndex: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}) {
  const t = useTranslations("admin.table");
  const pages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
      <p className="text-sm text-muted-foreground">
        {t("page", { current: pageIndex + 1, total: pages })} · {totalItems}
      </p>

      <div className="flex items-center gap-2">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{t("rowsPerPage")}</span>
            <NativeSelect
              className="h-8 w-20"
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              options={PAGE_SIZES.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
          </label>
        ) : null}

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={pageIndex <= 0}
          onClick={() => onPageChange(pageIndex - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={pageIndex + 1 >= pages}
          onClick={() => onPageChange(pageIndex + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

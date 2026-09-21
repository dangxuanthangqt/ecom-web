"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { PaginationBar } from "@/components/common/pagination-bar";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductFilters } from "@/components/storefront/product-filters";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/lib/api/hooks/use-products";
import type { ProductQuery } from "@/lib/api/types";

const DEFAULT_QUERY: ProductQuery = {
  pageIndex: 0,
  pageSize: 20,
  orderBy: "createdAt",
  order: "desc",
};

export function ProductBrowser({
  initialQuery,
}: {
  initialQuery: Partial<ProductQuery>;
}) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const [query, setQuery] = useState<ProductQuery>({
    ...DEFAULT_QUERY,
    ...initialQuery,
  });
  const [keywordDraft, setKeywordDraft] = useState(initialQuery.keyword ?? "");

  const { data, isPending, isError, refetch } = useProducts(query);

  const patch = (next: Partial<ProductQuery>) =>
    setQuery((previous) => ({ ...previous, ...next }));

  const total = data?.pagination.totalItems ?? 0;
  const heading = useMemo(
    () => t("resultCount", { count: total }),
    [t, total],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{heading}</p>
        </div>

        <form
          className="w-full max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            patch({ keyword: keywordDraft.trim() || undefined, pageIndex: 0 });
          }}
        >
          <label htmlFor="product-search" className="sr-only">
            {tCommon("search")}
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="product-search"
              className="pl-8"
              value={keywordDraft}
              onChange={(event) => setKeywordDraft(event.target.value)}
              placeholder={tCommon("searchPlaceholder")}
            />
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ProductFilters
          value={query}
          onChange={patch}
          onReset={() => {
            setKeywordDraft("");
            setQuery(DEFAULT_QUERY);
          }}
        />

        <div className="min-w-0 flex-1 space-y-6">
          {isPending ? <CardGridSkeleton /> : null}

          {isError ? (
            <ErrorState
              title={tCommon("error")}
              description={tCommon("unexpectedError")}
              retryLabel={tCommon("retry")}
              onRetry={() => void refetch()}
            />
          ) : null}

          {data && data.data.length === 0 ? (
            <EmptyState title={t("empty")} />
          ) : null}

          {data && data.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {data.data.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 4}
                  />
                ))}
              </div>

              <PaginationBar
                pageIndex={data.pagination.pageIndex}
                pageSize={data.pagination.pageSize}
                totalPages={data.pagination.totalPages}
                totalItems={data.pagination.totalItems}
                onPageChange={(pageIndex) => patch({ pageIndex })}
                onPageSizeChange={(pageSize) =>
                  patch({ pageSize, pageIndex: 0 })
                }
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmButton } from "@/components/common/confirm-button";
import { NativeSelect } from "@/components/common/native-select";
import { StarRating } from "@/components/common/star-rating";
import { EmptyState, RowsSkeleton } from "@/components/common/states";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  useDeleteReview,
  useReviews,
  useSaveReview,
} from "@/lib/api/hooks/use-reviews";
import { useApiErrorMessage } from "@/lib/api/use-error-toast";
import { formatDate } from "@/lib/format";

export function ProductReviews({ productId }: { productId: string }) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const errorMessage = useApiErrorMessage();
  const locale = useLocale() as Locale;
  const { profile, isAuthenticated } = useSession();

  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rating, setRating] = useState("5");
  const [content, setContent] = useState("");

  const { data, isPending } = useReviews(productId, {
    page,
    pageSize: 10,
    orderBy: "createdAt",
    order: "desc",
  });
  const saveReview = useSaveReview();
  const deleteReview = useDeleteReview();

  const reviews = data?.data ?? [];
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const reset = () => {
    setEditingId(null);
    setRating("5");
    setContent("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await saveReview.mutateAsync({
        id: editingId ?? undefined,
        body: {
          ...(editingId ? {} : { productId }),
          rating: Number(rating),
          content: content.trim(),
        },
      });
      toast.success(t("posted"));
      reset();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <section className="mt-14 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-2xl font-bold">{t("title")}</h2>
        {reviews.length > 0 ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarRating
              value={average}
              label={t("averageRating", { rating: average.toFixed(1) })}
            />
            {t("count", { count: data?.pagination.totalItems ?? 0 })}
          </span>
        ) : null}
      </div>

      {isAuthenticated ? (
        <form
          onSubmit={submit}
          className="space-y-3 rounded-xl border border-border bg-card p-4"
        >
          <p className="font-heading font-semibold">
            {editingId ? t("edit") : t("write")}
          </p>

          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="review-rating">{t("rating")}</Label>
              <NativeSelect
                id="review-rating"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                options={[5, 4, 3, 2, 1].map((value) => ({
                  value: String(value),
                  label: `${value} ★`,
                }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-content">{t("content")}</Label>
              <Textarea
                id="review-content"
                required
                rows={3}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t("contentPlaceholder")}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="cta" disabled={saveReview.isPending}>
              {t("submit")}
            </Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={reset}>
                {tCommon("cancel")}
              </Button>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-link underline">
            {t("signInToReview")}
          </Link>
        </p>
      )}

      {isPending ? <RowsSkeleton rows={3} /> : null}

      {!isPending && reviews.length === 0 ? (
        <EmptyState title={t("count", { count: 0 })} />
      ) : null}

      <ul className="space-y-3">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{review.user.name}</span>
                <StarRating
                  value={review.rating}
                  label={t("averageRating", { rating: review.rating })}
                />
              </div>
              <time
                dateTime={review.createdAt}
                className="text-xs text-muted-foreground"
              >
                {formatDate(review.createdAt, locale)}
              </time>
            </div>

            <p className="mt-2 text-sm whitespace-pre-line">{review.content}</p>

            {profile?.id === review.userId ? (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(review.id);
                    setRating(String(review.rating));
                    setContent(review.content);
                  }}
                >
                  <Pencil aria-hidden="true" />
                  {tCommon("edit")}
                </Button>
                <ConfirmButton
                  title={tCommon("delete")}
                  confirmLabel={tCommon("delete")}
                  pending={deleteReview.isPending}
                  onConfirm={async () => {
                    await deleteReview.mutateAsync(review.id);
                    toast.success(t("deleted"));
                  }}
                  trigger={
                    <Button variant="destructive" size="sm">
                      <Trash2 aria-hidden="true" />
                      {tCommon("delete")}
                    </Button>
                  }
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {data && data.pagination.totalPages > 1 ? (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            {tCommon("back")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            {tCommon("view")}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

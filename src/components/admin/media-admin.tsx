"use client";

import { Copy, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage } from "@/components/admin/admin-page";
import { Field } from "@/components/common/field";
import { RemoteImage } from "@/components/common/remote-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteMedia,
  usePresignedUrl,
  useUploadImage,
  useUploadImageFields,
  useUploadImages,
} from "@/lib/api/hooks/use-media";
import { useApiErrors } from "@/lib/api/use-error-toast";

export function MediaAdmin() {
  const t = useTranslations("admin.media");
  const tAdmin = useTranslations("admin");
  const tCommon = useTranslations("common");

  const uploadImage = useUploadImage();
  const uploadImages = useUploadImages();
  const uploadFields = useUploadImageFields();
  const presignedUrl = usePresignedUrl();
  const deleteMedia = useDeleteMedia();
  const { report } = useApiErrors();

  const [urls, setUrls] = useState<string[]>([]);

  const remember = (next: string[]) =>
    setUrls((previous) => [...next, ...previous].slice(0, 24));

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success(t("copied"));
  };

  return (
    <AdminPage title={tAdmin("media")}>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="font-heading font-semibold">{t("singleUpload")}</h2>
          <p className="text-xs text-muted-foreground">{t("dropHint")}</p>

          <Input
            type="file"
            accept="image/png,image/jpeg"
            disabled={uploadImage.isPending}
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) return;

              try {
                const result = await uploadImage.mutateAsync(file);

                remember([result.url]);
                toast.success(t("uploaded"));
              } catch (error) {
                report(error);
              } finally {
                event.target.value = "";
              }
            }}
          />
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="font-heading font-semibold">{t("arrayUpload")}</h2>
          <p className="text-xs text-muted-foreground">{t("dropHint")}</p>

          <Input
            type="file"
            multiple
            accept="image/png,image/jpeg"
            disabled={uploadImages.isPending}
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);

              if (files.length === 0) return;

              try {
                const result = await uploadImages.mutateAsync(files);

                remember(result.urls ?? []);
                toast.success(t("uploaded"));
              } catch (error) {
                report(error);
              } finally {
                event.target.value = "";
              }
            }}
          />
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="font-heading font-semibold">{t("multipleUpload")}</h2>

          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();

              const form = event.currentTarget;
              const data = new FormData(form);
              const file1 = data.get("file1");
              const file3 = data
                .getAll("file3")
                .filter((item): item is File => item instanceof File && item.size > 0);

              try {
                const result = await uploadFields.mutateAsync({
                  file1: file1 instanceof File && file1.size > 0 ? file1 : undefined,
                  file3,
                });

                remember(result.urls ?? []);
                toast.success(t("uploaded"));
                form.reset();
              } catch (error) {
                report(error);
              }
            }}
          >
            <Field id="file1" label="file1">
              <Input
                id="file1"
                name="file1"
                type="file"
                accept="image/png,image/jpeg"
              />
            </Field>

            <Field id="file3" label="file3">
              <Input
                id="file3"
                name="file3"
                type="file"
                multiple
                accept="image/png,image/jpeg"
              />
            </Field>

            <Button type="submit" variant="cta" disabled={uploadFields.isPending}>
              <Upload aria-hidden="true" />
              {tCommon("submit")}
            </Button>
          </form>
        </section>

        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <h2 className="font-heading font-semibold">{t("presigned")}</h2>

          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();

              const data = new FormData(event.currentTarget);

              try {
                const result = await presignedUrl.mutateAsync({
                  key: String(data.get("key")),
                  type: String(data.get("type")),
                });

                remember([result.url]);
              } catch (error) {
                report(error);
              }
            }}
          >
            <Field id="presign-key" label={t("key")} required>
              <Input id="presign-key" name="key" required />
            </Field>

            <Field id="presign-type" label={t("type")} required>
              <Input
                id="presign-type"
                name="type"
                required
                defaultValue="image/png"
              />
            </Field>

            <Button type="submit" variant="outline" disabled={presignedUrl.isPending}>
              {t("getUrl")}
            </Button>
          </form>

          <form
            className="flex items-end gap-2 border-t border-border pt-3"
            onSubmit={async (event) => {
              event.preventDefault();

              const form = event.currentTarget;
              const data = new FormData(form);

              try {
                await deleteMedia.mutateAsync(String(data.get("deleteKey")));
                toast.success(t("deleted"));
                form.reset();
              } catch (error) {
                report(error);
              }
            }}
          >
            <Field id="deleteKey" label={t("deleteObject")} className="flex-1">
              <Input id="deleteKey" name="deleteKey" required />
            </Field>
            <Button type="submit" variant="destructive" disabled={deleteMedia.isPending}>
              <Trash2 aria-hidden="true" />
            </Button>
          </form>
        </section>
      </div>

      {urls.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {urls.map((url) => (
            <li
              key={url}
              className="space-y-2 rounded-xl border border-border bg-card p-2"
            >
              <RemoteImage src={url} alt="" className="aspect-square w-full" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => void copy(url)}
              >
                <Copy aria-hidden="true" />
                {t("copy")}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </AdminPage>
  );
}

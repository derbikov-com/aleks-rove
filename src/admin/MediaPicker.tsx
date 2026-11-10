"use client";

import { useRef, useState } from "react";
import { cn } from "@/components/ui";
import { api, API_URL, errorMessage } from "./api";
import { useLoad } from "./hooks";
import type { Media, PageResponse } from "./types";
import { Button, EmptyState, ErrorBlock, LoadingBlock, Modal, Pagination, useToast } from "./ui";

const PAGE_SIZE = 24;
export const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";

/** Загрузка файла в медиабиблиотеку (multipart). */
export async function uploadMedia(file: File, alt = ""): Promise<Media> {
  const form = new FormData();
  form.append("file", file);
  const q = alt ? `?alt=${encodeURIComponent(alt)}` : "";
  return api.post<Media>(`/api/admin/media${q}`, form);
}

/** Окно выбора файла из медиабиблиотеки с возможностью загрузить новый. */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  imagesOnly = true,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  imagesOnly?: boolean;
}) {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, error, loading, reload } = useLoad(
    () => (open ? api.get<PageResponse<Media>>(`/api/admin/media?page=${page}&size=${PAGE_SIZE}`) : Promise.resolve(null)),
    [open, page],
  );
  const items = (data?.items ?? []).filter((m) => !imagesOnly || m.contentType.startsWith("image/"));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file);
      toast("Файл загружен");
      onSelect(media);
      onClose();
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Медиабиблиотека"
      wide
      footer={
        <>
          <input
            ref={inputRef}
            type="file"
            accept={imagesOnly ? "image/jpeg,image/png,image/webp,image/gif" : ACCEPT}
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button loading={uploading} onClick={() => inputRef.current?.click()}>
            Загрузить новый файл
          </Button>
        </>
      }
    >
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState title="Файлов пока нет" text="Загрузите картинку кнопкой внизу — она сразу подставится." />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(m);
                    onClose();
                  }}
                  className="group w-full overflow-hidden rounded-xl border border-line text-left transition hover:border-brand focus-visible:border-brand"
                >
                  <MediaThumb media={m} className="aspect-[4/3]" />
                  <span className="block truncate px-2.5 py-2 text-xs text-muted group-hover:text-ink">{m.filename}</span>
                </button>
              </li>
            ))}
          </ul>
          {data && <Pagination page={page} size={PAGE_SIZE} total={data.total} onPage={setPage} />}
        </>
      )}
    </Modal>
  );
}

export function MediaThumb({ media, className }: { media: Pick<Media, "url" | "contentType" | "alt" | "filename">; className?: string }) {
  if (!media.contentType.startsWith("image/")) {
    return (
      <span className={cn("grid place-items-center bg-paper text-sm font-bold text-muted", className)}>
        {media.contentType === "application/pdf" ? "PDF" : "Файл"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- превью в админке, оптимизация не нужна
    <img src={media.url} alt={media.alt || media.filename} loading="lazy" className={cn("w-full bg-paper object-cover", className)} />
  );
}

/** Абсолютный адрес картинки для превью: статика сайта (/images/...) или файл бэкенда. */
export function previewSrc(src: string) {
  return src.startsWith("/api/") ? `${API_URL}${src}` : src;
}

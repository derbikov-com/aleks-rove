"use client";

import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/components/ui";
import { api, errorMessage } from "@/admin/api";
import { useAuth } from "@/admin/auth";
import { confirmDelete } from "@/admin/editor";
import { fmtDate, fmtSize } from "@/admin/format";
import { useLoad } from "@/admin/hooks";
import { ACCEPT, MediaThumb, uploadMedia } from "@/admin/MediaPicker";
import type { Media, PageResponse } from "@/admin/types";
import { Button, EmptyState, ErrorBlock, Input, LoadingBlock, PageHeader, Pagination, useToast } from "@/admin/ui";

const SIZE = 24;

export default function MediaPage() {
  const toast = useToast();
  const { can } = useAuth();
  const canDelete = can("ADMIN", "EDITOR");
  const [page, setPage] = useState(0);
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, setData, error, loading, reload } = useLoad(
    () => api.get<PageResponse<Media>>(`/api/admin/media?page=${page}&size=${SIZE}`),
    [page],
  );

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploading(list.length);
    let ok = 0;
    for (const file of list) {
      try {
        await uploadMedia(file);
        ok++;
      } catch (e) {
        toast(`${file.name}: ${errorMessage(e)}`, "error");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (ok) toast(ok === 1 ? "Файл загружен" : `Загружено файлов: ${ok}`);
    if (inputRef.current) inputRef.current.value = "";
    setPage(0);
    reload();
  }

  async function saveAlt(m: Media, alt: string) {
    if (alt === m.alt) return;
    try {
      const updated = await api.put<Media>(`/api/admin/media/${m.id}`, { alt });
      setData((d) => (d ? { ...d, items: d.items.map((x) => (x.id === m.id ? updated : x)) } : d));
      toast("Описание сохранено");
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  }

  async function remove(m: Media) {
    if (!confirmDelete(`файл «${m.filename}» — там, где он использован, картинка пропадёт`)) return;
    try {
      await api.del(`/api/admin/media/${m.id}`);
      toast("Файл удалён");
      reload();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast("Ссылка скопирована");
    } catch {
      window.prompt("Скопируйте ссылку", url);
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    upload(e.dataTransfer.files);
  };

  return (
    <>
      <PageHeader
        title="Медиабиблиотека"
        description="Картинки и PDF для обложек, статей и страниц. JPEG, PNG, WebP, GIF, PDF — до 10 МБ"
        actions={
          <Button loading={uploading > 0} onClick={() => inputRef.current?.click()}>
            Загрузить файлы
          </Button>
        }
      />
      <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={cn(
          "mb-6 rounded-2xl border-2 border-dashed p-6 text-center text-sm text-muted transition-colors",
          drag ? "border-brand bg-brand-soft text-brand" : "border-line bg-white",
        )}
      >
        {uploading > 0 ? `Загружаем… осталось ${uploading}` : "Перетащите файлы сюда или нажмите «Загрузить файлы»"}
      </div>
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : !data?.items.length ? (
        <EmptyState title="Файлов пока нет" text="Загруженные картинки можно выбрать обложкой или вставить в текст статьи." />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((m) => (
              <li key={m.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <a href={m.url} target="_blank" rel="noreferrer" title="Открыть файл">
                  <MediaThumb media={m} className="aspect-[4/3]" />
                </a>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm font-semibold" title={m.filename}>
                    {m.filename}
                  </p>
                  <p className="text-xs text-muted">
                    {fmtSize(m.sizeBytes)}
                    {m.width && m.height ? ` · ${m.width}×${m.height}` : ""} · {fmtDate(m.createdAt)}
                  </p>
                  {m.contentType.startsWith("image/") && (
                    <Input
                      defaultValue={m.alt}
                      placeholder="Описание (alt)"
                      aria-label={`Описание файла ${m.filename}`}
                      className="h-9 text-sm"
                      onBlur={(e) => saveAlt(m, e.target.value.trim())}
                      disabled={!canDelete}
                    />
                  )}
                  <div className="flex gap-1">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => copy(m.url)}>
                      Копировать ссылку
                    </Button>
                    {canDelete && (
                      <Button variant="ghost" size="sm" onClick={() => remove(m)} aria-label={`Удалить ${m.filename}`}>
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}

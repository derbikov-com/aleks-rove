"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/admin/api";
import { useMe } from "@/admin/auth";
import { fmtDateTime } from "@/admin/format";
import { useLoad } from "@/admin/hooks";
import { POST_STATUS_LABEL, type AdminPostListItem, type PageResponse, type PostStatus } from "@/admin/types";
import { Badge, EmptyState, ErrorBlock, Input, LinkButton, LoadingBlock, PageHeader, Pagination, Select, Toggle } from "@/admin/ui";

const SIZE = 20;

export default function PostsPage() {
  const me = useMe();
  const [status, setStatus] = useState<"" | PostStatus>("");
  const [q, setQ] = useState("");
  const [mine, setMine] = useState(false);
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useLoad(() => {
    const p = new URLSearchParams({ page: String(page), size: String(SIZE), mine: String(mine) });
    if (status) p.set("status", status);
    if (q.trim()) p.set("q", q.trim());
    return api.get<PageResponse<AdminPostListItem>>(`/api/admin/posts?${p}`);
  }, [status, q, mine, page]);

  return (
    <>
      <PageHeader
        title="Статьи"
        description={me.role === "AUTHOR" ? "Ваши статьи. Черновики публикует редактор." : "Блог сайта: черновики и опубликованные"}
        actions={<LinkButton href="/admin/posts/new">Новая статья</LinkButton>}
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Поиск по заголовку" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} className="sm:max-w-xs" aria-label="Поиск" />
        <Select value={status} onChange={(e) => { setStatus(e.target.value as "" | PostStatus); setPage(0); }} className="sm:w-48" aria-label="Статус">
          <option value="">Все статусы</option>
          <option value="DRAFT">Черновики</option>
          <option value="PUBLISHED">Опубликованные</option>
        </Select>
        {me.role !== "AUTHOR" && <Toggle checked={mine} onChange={(v) => { setMine(v); setPage(0); }} label="Только мои" />}
      </div>
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState title="Статей не найдено" text="Создайте первую — она сохранится черновиком, пока вы её не опубликуете." action={<LinkButton href="/admin/posts/new">Новая статья</LinkButton>} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
              <thead className="border-b border-line text-sm text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Заголовок</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                  <th className="px-5 py-3 font-semibold">Категория</th>
                  <th className="px-5 py-3 font-semibold">Изменена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-paper/60">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/posts/${p.id}`} className="font-semibold hover:text-brand">
                        {p.title}
                      </Link>
                      <span className="block text-sm text-muted">/blog/{p.slug}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={p.status === "PUBLISHED" ? "green" : "neutral"}>{POST_STATUS_LABEL[p.status]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{p.categorySlug ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted">{fmtDateTime(p.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}

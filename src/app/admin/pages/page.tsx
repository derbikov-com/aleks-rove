"use client";

import Link from "next/link";
import { api } from "@/admin/api";
import { fmtDateTime } from "@/admin/format";
import { useLoad } from "@/admin/hooks";
import type { AdminPage } from "@/admin/types";
import { Badge, EmptyState, ErrorBlock, LinkButton, LoadingBlock, PageHeader } from "@/admin/ui";

export default function PagesPage() {
  const { data, error, loading, reload } = useLoad(() => api.get<AdminPage[]>("/api/admin/pages"), []);
  return (
    <>
      <PageHeader
        title="Страницы"
        description="Текстовые страницы по адресу /{адрес}: реквизиты, доставка, политика и т.п."
        actions={<LinkButton href="/admin/pages/new">Новая страница</LinkButton>}
      />
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState
          title="Страниц пока нет"
          text="Создайте, например, «Реквизиты» или замените политику конфиденциальности своей (адрес politika-konfidencialnosti)."
          action={<LinkButton href="/admin/pages/new">Новая страница</LinkButton>}
        />
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {data.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/pages/${p.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper/60">
                <span>
                  <span className="font-semibold">{p.title}</span>
                  <span className="block text-sm text-muted">/{p.slug}</span>
                </span>
                <span className="flex items-center gap-3 text-sm text-muted">
                  {!p.published && <Badge>Скрыта</Badge>}
                  {fmtDateTime(p.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { api } from "@/admin/api";
import { useLoad } from "@/admin/hooks";
import { previewSrc } from "@/admin/MediaPicker";
import type { AdminCase } from "@/admin/types";
import { Badge, EmptyState, ErrorBlock, LinkButton, LoadingBlock, PageHeader } from "@/admin/ui";

export default function CasesPage() {
  const { data, error, loading, reload } = useLoad(() => api.get<AdminCase[]>("/api/admin/cases"), []);
  return (
    <>
      <PageHeader title="Кейсы" description="Раздел /keisy и блок кейсов на главной" actions={<LinkButton href="/admin/cases/new">Новый кейс</LinkButton>} />
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="Кейсов пока нет" action={<LinkButton href="/admin/cases/new">Добавить кейс</LinkButton>} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/cases/${c.id}`} className="block overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand/40 hover:shadow-[var(--shadow-card)]">
                {c.cover?.src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- превью в админке
                  <img src={previewSrc(c.cover.src)} alt="" className="aspect-[16/10] w-full bg-paper object-cover" />
                ) : (
                  <span className="grid aspect-[16/10] place-items-center bg-paper text-sm text-muted">Без обложки</span>
                )}
                <span className="block p-4">
                  <span className="flex flex-wrap gap-1.5">
                    {!c.published && <Badge>Скрыт</Badge>}
                    {c.featured && <Badge tone="blue">На главной</Badge>}
                  </span>
                  <span className="mt-2 block font-bold leading-snug">{c.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {c.industry} · {c.year}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { api } from "@/admin/api";
import { useLoad } from "@/admin/hooks";
import type { AdminService } from "@/admin/types";
import { Badge, EmptyState, ErrorBlock, LinkButton, LoadingBlock, PageHeader } from "@/admin/ui";

export default function ServicesPage() {
  const { data, error, loading, reload } = useLoad(() => api.get<AdminService[]>("/api/admin/services"), []);
  return (
    <>
      <PageHeader title="Услуги" description="Раздел /uslugi и блок услуг на главной" actions={<LinkButton href="/admin/services/new">Новая услуга</LinkButton>} />
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="Услуг пока нет" action={<LinkButton href="/admin/services/new">Добавить услугу</LinkButton>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/services/${s.id}`} className="flex h-full items-start gap-4 rounded-2xl border border-line bg-white p-5 transition hover:border-brand/40 hover:shadow-[var(--shadow-card)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon name={s.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-bold">{s.title}</span>
                    {!s.published && <Badge>Скрыта</Badge>}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm text-muted">{s.shortText}</span>
                  <span className="mt-2 block text-xs text-muted">Порядок {s.position} · /uslugi/{s.slug}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

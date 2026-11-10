"use client";

import Link from "next/link";
import { api } from "@/admin/api";
import { useMe } from "@/admin/auth";
import { fmtDateTime } from "@/admin/format";
import { useLoad } from "@/admin/hooks";
import { LEAD_STATUS_LABEL, ROLE_LABEL, type AdminPostListItem, type Lead, type PageResponse } from "@/admin/types";
import { Badge, Card, LinkButton, PageHeader } from "@/admin/ui";

export default function Dashboard() {
  const me = useMe();
  const staff = me.role !== "AUTHOR";
  const { data } = useLoad(async () => {
    const [newLeads, drafts, published] = await Promise.all([
      staff ? api.get<PageResponse<Lead>>("/api/admin/leads?status=NEW&size=5") : Promise.resolve(null),
      api.get<PageResponse<AdminPostListItem>>("/api/admin/posts?status=DRAFT&size=5"),
      api.get<PageResponse<AdminPostListItem>>("/api/admin/posts?status=PUBLISHED&size=1"),
    ]);
    return { newLeads, drafts, published };
  }, [staff]);

  const hello = me.name ? `Здравствуйте, ${me.name}` : "Здравствуйте";
  return (
    <>
      <PageHeader title={hello} description={`${ROLE_LABEL[me.role]} · ${me.email}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        {staff && <Stat href="/admin/leads" label="Новых заявок" value={data?.newLeads?.total} accent />}
        <Stat href="/admin/posts" label={staff ? "Черновиков статей" : "Ваших черновиков"} value={data?.drafts.total} />
        <Stat href="/admin/posts" label="Опубликовано статей" value={data?.published.total} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {staff && (
          <Card title="Новые заявки">
            {data?.newLeads?.items.length ? (
              <ul className="divide-y divide-line">
                {data.newLeads.items.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      <span className="font-semibold">{l.name}</span>
                      <span className="block text-sm text-muted">
                        {l.phone} · {fmtDateTime(l.createdAt)}
                      </span>
                    </span>
                    <Badge tone="blue">{LEAD_STATUS_LABEL[l.status]}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Новых заявок нет.</p>
            )}
            <Link href="/admin/leads" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
              Все заявки →
            </Link>
          </Card>
        )}
        <Card title="Черновики">
          {data?.drafts.items.length ? (
            <ul className="divide-y divide-line">
              {data.drafts.items.map((p) => (
                <li key={p.id} className="py-3">
                  <Link href={`/admin/posts/${p.id}`} className="font-semibold hover:text-brand">
                    {p.title}
                  </Link>
                  <span className="block text-sm text-muted">Изменён {fmtDateTime(p.updatedAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Черновиков нет.</p>
          )}
          <div className="mt-4 flex gap-2">
            <LinkButton href="/admin/posts/new" size="sm">
              Новая статья
            </LinkButton>
            <LinkButton href="/admin/media" variant="secondary" size="sm">
              Загрузить картинки
            </LinkButton>
          </div>
        </Card>
      </div>
    </>
  );
}

function Stat({ href, label, value, accent }: { href: string; label: string; value?: number; accent?: boolean }) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-white p-5 transition hover:border-brand/40 hover:shadow-[var(--shadow-card)]">
      <span className={accent && value ? "text-4xl font-extrabold text-brand" : "text-4xl font-extrabold"}>{value ?? "…"}</span>
      <span className="mt-1 block text-sm text-muted">{label}</span>
    </Link>
  );
}

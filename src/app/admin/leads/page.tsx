"use client";

import { useState } from "react";
import { cn } from "@/components/ui";
import { api } from "@/admin/api";
import { saveError } from "@/admin/editor";
import { fmtDateTime } from "@/admin/format";
import { useLoad } from "@/admin/hooks";
import { LEAD_STATUS_LABEL, type Lead, type LeadStatus, type PageResponse } from "@/admin/types";
import { Badge, Button, EmptyState, ErrorBlock, Field, LoadingBlock, Modal, PageHeader, Pagination, Select, Textarea, useToast } from "@/admin/ui";

const SIZE = 20;
const TONE: Record<LeadStatus, "blue" | "amber" | "green" | "neutral"> = { NEW: "blue", IN_PROGRESS: "amber", DONE: "green", SPAM: "neutral" };
const TABS: ("" | LeadStatus)[] = ["", "NEW", "IN_PROGRESS", "DONE", "SPAM"];

export default function LeadsPage() {
  const toast = useToast();
  const [status, setStatus] = useState<"" | LeadStatus>("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Lead | null>(null);
  const [edit, setEdit] = useState<{ status: LeadStatus; comment: string }>({ status: "NEW", comment: "" });
  const [busy, setBusy] = useState(false);
  const { data, setData, error, loading, reload } = useLoad(() => {
    const p = new URLSearchParams({ page: String(page), size: String(SIZE) });
    if (status) p.set("status", status);
    return api.get<PageResponse<Lead>>(`/api/admin/leads?${p}`);
  }, [status, page]);

  const show = (l: Lead) => {
    setOpen(l);
    setEdit({ status: l.status === "NEW" ? "IN_PROGRESS" : l.status, comment: l.comment ?? "" });
  };

  async function save() {
    if (!open) return;
    setBusy(true);
    try {
      const updated = await api.put<Lead>(`/api/admin/leads/${open.id}`, edit);
      setData((d) => (d ? { ...d, items: d.items.map((x) => (x.id === updated.id ? updated : x)) } : d));
      toast("Заявка обновлена");
      setOpen(null);
    } catch (e) {
      toast(saveError(e).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Заявки" description="Заявки с форм сайта. Уведомления уходят на почты из «Настроек сайта»" />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Статус">
        {TABS.map((t) => (
          <button
            key={t || "all"}
            type="button"
            role="tab"
            aria-selected={status === t}
            onClick={() => {
              setStatus(t);
              setPage(0);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              status === t ? "bg-ink text-white" : "bg-white text-ink hover:bg-line",
            )}
          >
            {t ? LEAD_STATUS_LABEL[t] : "Все"}
          </button>
        ))}
      </div>
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : !data?.items.length ? (
        <EmptyState title="Заявок нет" text={status ? "В этом статусе пусто." : "Новые заявки с сайта появятся здесь."} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[720px] text-left text-[0.9375rem]">
              <thead className="border-b border-line text-sm text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Когда</th>
                  <th className="px-5 py-3 font-semibold">Клиент</th>
                  <th className="px-5 py-3 font-semibold">Сообщение</th>
                  <th className="px-5 py-3 font-semibold">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((l) => (
                  <tr key={l.id} onClick={() => show(l)} className={cn("cursor-pointer hover:bg-paper/60", l.status === "NEW" && "font-semibold")}>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm text-muted">{fmtDateTime(l.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <button type="button" className="text-left hover:text-brand" onClick={(e) => { e.stopPropagation(); show(l); }}>
                        {l.name}
                      </button>
                      <span className="block text-sm font-normal text-muted">
                        {l.phone}
                        {l.company ? ` · ${l.company}` : ""}
                      </span>
                    </td>
                    <td className="max-w-xs px-5 py-3.5 text-sm font-normal text-muted">
                      <span className="line-clamp-2">{l.message || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={TONE[l.status]}>{LEAD_STATUS_LABEL[l.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} size={SIZE} total={data.total} onPage={setPage} />
        </>
      )}

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `Заявка: ${open.name}` : ""}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(null)}>
              Закрыть
            </Button>
            <Button loading={busy} onClick={save}>
              Сохранить
            </Button>
          </>
        }
      >
        {open && (
          <div className="space-y-5">
            <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-[0.9375rem]">
              <dt className="text-muted">Телефон</dt>
              <dd>
                <a href={`tel:${open.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-brand">
                  {open.phone}
                </a>
              </dd>
              {open.email && (
                <>
                  <dt className="text-muted">Email</dt>
                  <dd>
                    <a href={`mailto:${open.email}`} className="text-brand">
                      {open.email}
                    </a>
                  </dd>
                </>
              )}
              {open.company && (
                <>
                  <dt className="text-muted">Компания</dt>
                  <dd>{open.company}</dd>
                </>
              )}
              <dt className="text-muted">Получена</dt>
              <dd>{fmtDateTime(open.createdAt)}</dd>
              <dt className="text-muted">Форма</dt>
              <dd>
                {open.source ?? "—"}
                {open.page ? ` · ${open.page}` : ""}
              </dd>
              {open.utm &&
                Object.entries(open.utm).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            {open.message && <p className="whitespace-pre-wrap rounded-xl bg-paper p-4">{open.message}</p>}
            <Field label="Статус">
              {(id) => (
                <Select id={id} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as LeadStatus })}>
                  {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Комментарий" hint="Видят только сотрудники">
              {(id) => <Textarea id={id} value={edit.comment} onChange={(e) => setEdit({ ...edit, comment: e.target.value })} />}
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}

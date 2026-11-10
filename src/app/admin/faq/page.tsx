"use client";

import { useState } from "react";
import { api } from "@/admin/api";
import { confirmDelete, saveError } from "@/admin/editor";
import type { FieldErrors } from "@/admin/forms";
import { useLoad } from "@/admin/hooks";
import type { Faq } from "@/admin/types";
import { Badge, Button, EmptyState, ErrorBlock, Field, Input, LoadingBlock, Modal, PageHeader, Textarea, Toggle, useToast } from "@/admin/ui";

type Draft = { item?: Faq; question: string; answer: string; position: number; published: boolean };

export default function FaqPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(() => api.get<Faq[]>("/api/admin/faq"), []);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!draft) return;
    setBusy(true);
    setErrors({});
    const body = { question: draft.question, answer: draft.answer, position: draft.position, published: draft.published };
    try {
      if (draft.item) await api.put(`/api/admin/faq/${draft.item.id}`, body);
      else await api.post("/api/admin/faq", body);
      toast("Вопрос сохранён");
      setDraft(null);
      reload();
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(f: Faq) {
    if (!confirmDelete("этот вопрос")) return;
    try {
      await api.del(`/api/admin/faq/${f.id}`);
      toast("Вопрос удалён");
      setDraft(null);
      reload();
    } catch (e) {
      toast(saveError(e).message, "error");
    }
  }

  const next = ((data ?? []).at(-1)?.position ?? 0) + 10;
  const add = () => {
    setErrors({});
    setDraft({ question: "", answer: "", position: next, published: true });
  };

  return (
    <>
      <PageHeader title="Вопросы (FAQ)" description="Блок «Частые вопросы» на главной" actions={<Button onClick={add}>Добавить вопрос</Button>} />
      {loading && !data ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="Вопросов пока нет" text="Блок FAQ на главной скрыт, пока здесь пусто." action={<Button onClick={add}>Добавить вопрос</Button>} />
      ) : (
        <ul className="space-y-3">
          {data.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setDraft({ item: f, question: f.question, answer: f.answer, position: f.position, published: f.published });
                }}
                className="w-full rounded-2xl border border-line bg-white p-5 text-left transition hover:border-brand/40"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="font-bold">{f.question}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                    {!f.published && <Badge>Скрыт</Badge>}#{f.position}
                  </span>
                </span>
                <span className="mt-2 line-clamp-2 block text-sm text-muted">{f.answer}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.item ? "Изменить вопрос" : "Новый вопрос"}
        footer={
          <>
            {draft?.item && (
              <Button variant="danger" className="mr-auto" onClick={() => remove(draft.item!)}>
                Удалить
              </Button>
            )}
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Отмена
            </Button>
            <Button loading={busy} onClick={save}>
              Сохранить
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Вопрос" required error={errors.question}>
              {(id) => <Input id={id} autoFocus value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />}
            </Field>
            <Field label="Ответ" required error={errors.answer}>
              {(id) => <Textarea id={id} rows={5} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />}
            </Field>
            <Field label="Порядок" hint="Меньше — выше">
              {(id) => <Input id={id} type="number" value={draft.position} onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) || 0 })} />}
            </Field>
            <Toggle checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} label="Показывать на сайте" />
          </div>
        )}
      </Modal>
    </>
  );
}

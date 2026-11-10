"use client";

import { useState } from "react";
import { api } from "@/admin/api";
import { confirmDelete, saveError } from "@/admin/editor";
import { slugify } from "@/admin/format";
import type { FieldErrors } from "@/admin/forms";
import { useLoad } from "@/admin/hooks";
import type { Category, Tag } from "@/admin/types";
import { Button, Card, ErrorBlock, Field, Input, LoadingBlock, Modal, PageHeader, Textarea, useToast } from "@/admin/ui";

type Editing =
  | { kind: "category"; item?: Category; name: string; slug: string; description: string; position: number }
  | { kind: "tag"; item?: Tag; name: string; slug: string };

export default function TaxonomyPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useLoad(
    () => Promise.all([api.get<Category[]>("/api/admin/categories"), api.get<Tag[]>("/api/admin/tags")]),
    [],
  );
  const [editing, setEditing] = useState<Editing | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const open = (e: Editing) => {
    setErrors({});
    setEditing(e);
  };

  async function save() {
    if (!editing) return;
    setBusy(true);
    setErrors({});
    const base = editing.kind === "category" ? "/api/admin/categories" : "/api/admin/tags";
    const body =
      editing.kind === "category"
        ? { name: editing.name, slug: editing.slug || null, description: editing.description, position: editing.position }
        : { name: editing.name, slug: editing.slug || null };
    try {
      if (editing.item) await api.put(`${base}/${editing.item.id}`, body);
      else await api.post(base, body);
      toast("Сохранено");
      setEditing(null);
      reload();
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(kind: "category" | "tag", item: Category | Tag) {
    const what = kind === "category" ? `категорию «${item.name}» (статьи останутся без категории)` : `метку «${item.name}»`;
    if (!confirmDelete(what)) return;
    try {
      await api.del(`/api/admin/${kind === "category" ? "categories" : "tags"}/${item.id}`);
      toast("Удалено");
      reload();
    } catch (e) {
      toast(saveError(e).message, "error");
    }
  }

  if (loading && !data) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error ?? "Ошибка"} onRetry={reload} />;
  const [categories, tags] = data;

  return (
    <>
      <PageHeader title="Рубрики и метки" description="Категории блога (/blog/kategoriya/…) и метки статей (/blog/teg/…)" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Категории">
          <ul className="divide-y divide-line">
            {categories.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 py-3">
                <span>
                  <span className="font-semibold">{c.name}</span>
                  <span className="block text-sm text-muted">/{c.slug} · порядок {c.position}</span>
                  {c.description && <span className="mt-1 block text-sm text-muted">{c.description}</span>}
                </span>
                <span className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => open({ kind: "category", item: c, name: c.name, slug: c.slug, description: c.description, position: c.position })}>
                    Изменить
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove("category", c)}>
                    Удалить
                  </Button>
                </span>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => open({ kind: "category", name: "", slug: "", description: "", position: (categories.length + 1) * 10 })}>
            Добавить категорию
          </Button>
        </Card>
        <Card title="Метки">
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => open({ kind: "tag", item: t, name: t.name, slug: t.slug })}
                  className="rounded-full border border-line px-3 py-1.5 text-sm font-medium hover:border-brand hover:text-brand"
                  title="Изменить"
                >
                  #{t.name}
                </button>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => open({ kind: "tag", name: "", slug: "" })}>
            Добавить метку
          </Button>
        </Card>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.item ? "Изменить" : "Новая"} ${editing.kind === "category" ? "категорию" : "метку"}` : ""}
        footer={
          <>
            {editing?.kind === "tag" && editing.item && (
              <Button variant="danger" className="mr-auto" onClick={() => { const t = editing.item!; setEditing(null); remove("tag", t); }}>
                Удалить
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Отмена
            </Button>
            <Button loading={busy} onClick={save}>
              Сохранить
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Название" required error={errors.name}>
              {(id) => <Input id={id} autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />}
            </Field>
            <Field label="Адрес" error={errors.slug} hint={`Пусто — ${slugify(editing.name) || "из названия"}`}>
              {(id) => (
                <Input id={id} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
              )}
            </Field>
            {editing.kind === "category" && (
              <>
                <Field label="Описание" hint="Показывается в шапке страницы категории">
                  {(id) => <Textarea id={id} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />}
                </Field>
                <Field label="Порядок">
                  {(id) => <Input id={id} type="number" value={editing.position} onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) || 0 })} />}
                </Field>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

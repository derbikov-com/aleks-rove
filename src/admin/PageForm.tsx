"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api";
import { confirmDelete, EditorLayout, saveError, SeoDetails, useUnsavedWarning } from "./editor";
import { cleanSeo, SeoFields, SlugField, type FieldErrors } from "./forms";
import { RichText } from "./RichText";
import type { AdminPage, Seo } from "./types";
import { Button, Card, Field, Input, LinkButton, PageHeader, Toggle, useToast } from "./ui";

type State = { slug: string; title: string; body: string; published: boolean; seo: Seo };
const fromPage = (p?: AdminPage): State => ({
  slug: p?.slug ?? "",
  title: p?.title ?? "",
  body: p?.body ?? "",
  published: p?.published ?? true,
  seo: p?.seo ?? {},
});

export function PageForm({ page }: { page?: AdminPage }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState(() => fromPage(page));
  const [saved, setSaved] = useState(page);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);
  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  async function save() {
    setBusy(true);
    setErrors({});
    const body = { ...s, slug: s.slug.trim() || null, seo: cleanSeo(s.seo) ?? null };
    try {
      const r = saved ? await api.put<AdminPage>(`/api/admin/pages/${saved.id}`, body) : await api.post<AdminPage>("/api/admin/pages", body);
      setSaved(r);
      setS(fromPage(r));
      setDirty(false);
      toast("Страница сохранена");
      if (!saved) router.replace(`/admin/pages/${r.id}`);
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!saved || !confirmDelete(`страницу «${saved.title}»`)) return;
    try {
      await api.del(`/api/admin/pages/${saved.id}`);
      setDirty(false);
      toast("Страница удалена");
      router.push("/admin/pages");
    } catch (e) {
      toast(saveError(e).message, "error");
    }
  }

  return (
    <>
      <PageHeader
        back={{ href: "/admin/pages", label: "Все страницы" }}
        title={saved ? saved.title : "Новая страница"}
        actions={saved?.published && <LinkButton href={`/${saved.slug}`} variant="secondary">Открыть на сайте ↗</LinkButton>}
      />
      <EditorLayout
        main={
          <>
            <Card>
              <div className="space-y-5">
                <Field label="Заголовок" required error={errors.title}>
                  {(id) => <Input id={id} value={s.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} className="text-lg font-semibold" />}
                </Field>
                <SlugField value={s.slug} onChange={(v) => set("slug", v)} title={s.title} prefix="/" error={errors.slug} />
              </div>
            </Card>
            <div>
              <p className="mb-1.5 text-sm font-semibold">
                Текст <span className="text-danger">*</span>
              </p>
              <RichText value={s.body} onChange={(v) => set("body", v)} invalid={!!errors.body} />
              {errors.body && <p className="mt-1.5 text-sm font-medium text-danger">{errors.body}</p>}
            </div>
          </>
        }
        side={
          <>
            <Card title="Публикация">
              <div className="space-y-4">
                <Toggle checked={s.published} onChange={(v) => set("published", v)} label="Показывать на сайте" />
                <p className="text-sm text-muted">
                  Страница с адресом <b>politika-konfidencialnosti</b> заменяет встроенный шаблон политики конфиденциальности.
                </p>
                <Button className="w-full" loading={busy} onClick={save}>
                  Сохранить
                </Button>
                {saved && (
                  <Button variant="danger" className="w-full" onClick={remove}>
                    Удалить
                  </Button>
                )}
              </div>
            </Card>
            <SeoDetails>
              <SeoFields value={s.seo} onChange={(v) => set("seo", v)} fallbackTitle={s.title} />
            </SeoDetails>
          </>
        }
      />
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/components/ui";
import { api } from "./api";
import { confirmDelete, EditorLayout, saveError, SeoDetails, useUnsavedWarning } from "./editor";
import { cleanSeo, ImageField, ListEditor, MetricsEditor, SeoFields, SlugField, type FieldErrors } from "./forms";
import { useLoad } from "./hooks";
import type { AdminCase, AdminService, Image, Metric, Seo } from "./types";
import { Button, Card, Field, Input, LinkButton, PageHeader, Textarea, Toggle, useToast } from "./ui";

type State = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  year: number;
  excerpt: string;
  cover?: Image;
  challenge: string;
  solution: string[];
  results: Metric[];
  stack: string[];
  serviceSlugs: string[];
  featured: boolean;
  position: number;
  published: boolean;
  seo: Seo;
};

const fromCase = (x?: AdminCase): State => ({
  slug: x?.slug ?? "",
  title: x?.title ?? "",
  client: x?.client ?? "",
  industry: x?.industry ?? "",
  year: x?.year ?? new Date().getFullYear(),
  excerpt: x?.excerpt ?? "",
  cover: x?.cover,
  challenge: x?.challenge ?? "",
  solution: x?.solution ?? [""],
  results: x?.results ?? [{ value: "", label: "" }],
  stack: x?.stack ?? [],
  serviceSlugs: x?.serviceSlugs ?? [],
  featured: x?.featured ?? false,
  position: x?.position ?? 0,
  published: x?.published ?? true,
  seo: x?.seo ?? {},
});

export function CaseForm({ item }: { item?: AdminCase }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState(() => fromCase(item));
  const [saved, setSaved] = useState(item);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);
  const { data: services } = useLoad(() => api.get<AdminService[]>("/api/admin/services"), []);
  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  async function save() {
    setBusy(true);
    setErrors({});
    const body = { ...s, slug: s.slug.trim() || null, cover: s.cover?.src ? s.cover : null, seo: cleanSeo(s.seo) ?? null };
    try {
      const r = saved ? await api.put<AdminCase>(`/api/admin/cases/${saved.id}`, body) : await api.post<AdminCase>("/api/admin/cases", body);
      setSaved(r);
      setS(fromCase(r));
      setDirty(false);
      toast("Кейс сохранён");
      if (!saved) router.replace(`/admin/cases/${r.id}`);
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!saved || !confirmDelete(`кейс «${saved.title}»`)) return;
    try {
      await api.del(`/api/admin/cases/${saved.id}`);
      setDirty(false);
      toast("Кейс удалён");
      router.push("/admin/cases");
    } catch (e) {
      toast(saveError(e).message, "error");
    }
  }

  return (
    <>
      <PageHeader
        back={{ href: "/admin/cases", label: "Все кейсы" }}
        title={saved ? saved.title : "Новый кейс"}
        actions={saved?.published && <LinkButton href={`/keisy/${saved.slug}`} variant="secondary">Открыть на сайте ↗</LinkButton>}
      />
      <EditorLayout
        main={
          <>
            <Card>
              <div className="space-y-5">
                <Field label="Название" required error={errors.title}>
                  {(id) => <Input id={id} value={s.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} className="text-lg font-semibold" />}
                </Field>
                <SlugField value={s.slug} onChange={(v) => set("slug", v)} title={s.title} prefix="/keisy/" error={errors.slug} />
                <div className="grid gap-5 sm:grid-cols-[1fr_1fr_8rem]">
                  <Field label="Клиент" required error={errors.client} hint="Можно обезличить">
                    {(id) => <Input id={id} value={s.client} onChange={(e) => set("client", e.target.value)} aria-invalid={!!errors.client} />}
                  </Field>
                  <Field label="Отрасль" required error={errors.industry}>
                    {(id) => <Input id={id} value={s.industry} onChange={(e) => set("industry", e.target.value)} aria-invalid={!!errors.industry} />}
                  </Field>
                  <Field label="Год" required error={errors.year}>
                    {(id) => <Input id={id} type="number" value={s.year} onChange={(e) => set("year", Number(e.target.value))} aria-invalid={!!errors.year} />}
                  </Field>
                </div>
                <Field label="Кратко" required error={errors.excerpt} hint="Для карточки кейса и поисковиков">
                  {(id) => <Textarea id={id} rows={2} value={s.excerpt} onChange={(e) => set("excerpt", e.target.value)} aria-invalid={!!errors.excerpt} />}
                </Field>
              </div>
            </Card>
            <Card>
              <div className="space-y-6">
                <Field label="Задача" required error={errors.challenge}>
                  {(id) => <Textarea id={id} rows={4} value={s.challenge} onChange={(e) => set("challenge", e.target.value)} aria-invalid={!!errors.challenge} />}
                </Field>
                <ListEditor label="Что сделали" hint="Шаги по порядку" items={s.solution} onChange={(v) => set("solution", v)} multiline />
                <MetricsEditor items={s.results} onChange={(v) => set("results", v)} />
                <ListEditor label="Технологии" items={s.stack} onChange={(v) => set("stack", v)} placeholder="React" />
              </div>
            </Card>
          </>
        }
        side={
          <>
            <Card title="Публикация">
              <div className="space-y-4">
                <Toggle checked={s.published} onChange={(v) => set("published", v)} label="Показывать на сайте" />
                <Toggle checked={s.featured} onChange={(v) => set("featured", v)} label="На главной" hint="В блоке «Кейсы» показываются первые три" />
                <Field label="Порядок" hint="Меньше — выше в списке">
                  {(id) => <Input id={id} type="number" value={s.position} onChange={(e) => set("position", Number(e.target.value) || 0)} />}
                </Field>
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
            <Card>
              <ImageField label="Обложка" value={s.cover} onChange={(v) => set("cover", v)} hint="Лучше 1600×1000 и больше" />
            </Card>
            <Card title="Услуги в кейсе" description="Кейс появится на страницах этих услуг">
              <div className="flex flex-wrap gap-2">
                {(services ?? []).map((sv) => {
                  const on = s.serviceSlugs.includes(sv.slug);
                  return (
                    <button
                      key={sv.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("serviceSlugs", on ? s.serviceSlugs.filter((x) => x !== sv.slug) : [...s.serviceSlugs, sv.slug])}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-left text-sm font-medium transition-colors",
                        on ? "border-brand bg-brand text-white" : "border-line hover:border-ink/40",
                      )}
                    >
                      {sv.title}
                    </button>
                  );
                })}
              </div>
              {errors.serviceSlugs && <p className="mt-2 text-sm text-danger">{errors.serviceSlugs}</p>}
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

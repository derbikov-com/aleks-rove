"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/components/ui";
import { api } from "./api";
import { confirmDelete, EditorLayout, saveError, SeoDetails, useUnsavedWarning } from "./editor";
import { cleanSeo, ListEditor, SeoFields, SlugField, type FieldErrors } from "./forms";
import type { AdminService, Seo, ServiceIcon } from "./types";
import { Button, Card, Field, Input, LinkButton, PageHeader, Textarea, Toggle, useToast } from "./ui";

const ICONS: { value: ServiceIcon; label: string }[] = [
  { value: "compass", label: "Компас" },
  { value: "code", label: "Код" },
  { value: "workflow", label: "Процесс" },
  { value: "plug", label: "Интеграция" },
  { value: "chart", label: "График" },
  { value: "shield", label: "Щит" },
];

type State = Omit<AdminService, "id" | "updatedAt" | "seo" | "duration" | "format"> & { seo: Seo; duration: string; format: string };

const fromService = (x?: AdminService): State => ({
  slug: x?.slug ?? "",
  title: x?.title ?? "",
  shortText: x?.shortText ?? "",
  leadText: x?.leadText ?? "",
  icon: x?.icon ?? "compass",
  features: x?.features ?? [""],
  deliverables: x?.deliverables ?? [""],
  duration: x?.duration ?? "",
  format: x?.format ?? "",
  position: x?.position ?? 0,
  published: x?.published ?? true,
  seo: x?.seo ?? {},
});

export function ServiceForm({ service }: { service?: AdminService }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState(() => fromService(service));
  const [saved, setSaved] = useState(service);
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
      const r = saved ? await api.put<AdminService>(`/api/admin/services/${saved.id}`, body) : await api.post<AdminService>("/api/admin/services", body);
      setSaved(r);
      setS(fromService(r));
      setDirty(false);
      toast("Услуга сохранена");
      if (!saved) router.replace(`/admin/services/${r.id}`);
    } catch (e) {
      const err = saveError(e);
      setErrors(err.fields);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!saved || !confirmDelete(`услугу «${saved.title}»`)) return;
    try {
      await api.del(`/api/admin/services/${saved.id}`);
      setDirty(false);
      toast("Услуга удалена");
      router.push("/admin/services");
    } catch (e) {
      toast(saveError(e).message, "error");
    }
  }

  return (
    <>
      <PageHeader
        back={{ href: "/admin/services", label: "Все услуги" }}
        title={saved ? saved.title : "Новая услуга"}
        actions={saved?.published && <LinkButton href={`/uslugi/${saved.slug}`} variant="secondary">Открыть на сайте ↗</LinkButton>}
      />
      <EditorLayout
        main={
          <>
            <Card>
              <div className="space-y-5">
                <Field label="Название" required error={errors.title}>
                  {(id) => <Input id={id} value={s.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} className="text-lg font-semibold" />}
                </Field>
                <SlugField value={s.slug} onChange={(v) => set("slug", v)} title={s.title} prefix="/uslugi/" error={errors.slug} />
                <Field label="Кратко" required error={errors.shortText} hint="Одно предложение для карточки услуги">
                  {(id) => <Textarea id={id} rows={2} value={s.shortText} onChange={(e) => set("shortText", e.target.value)} aria-invalid={!!errors.shortText} />}
                </Field>
                <Field label="Вводный абзац" required error={errors.leadText} hint="Под заголовком на странице услуги">
                  {(id) => <Textarea id={id} rows={3} value={s.leadText} onChange={(e) => set("leadText", e.target.value)} aria-invalid={!!errors.leadText} />}
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Сроки" hint="Например: от 4 недель">
                    {(id) => <Input id={id} value={s.duration} onChange={(e) => set("duration", e.target.value)} />}
                  </Field>
                  <Field label="Формат работы" hint="Например: фиксированная стоимость">
                    {(id) => <Input id={id} value={s.format} onChange={(e) => set("format", e.target.value)} />}
                  </Field>
                </div>
              </div>
            </Card>
            <Card>
              <div className="space-y-6">
                <ListEditor label="Что входит в работу" items={s.features} onChange={(v) => set("features", v)} />
                <ListEditor label="Что получит клиент" items={s.deliverables} onChange={(v) => set("deliverables", v)} />
              </div>
            </Card>
          </>
        }
        side={
          <>
            <Card title="Публикация">
              <div className="space-y-4">
                <Toggle checked={s.published} onChange={(v) => set("published", v)} label="Показывать на сайте" />
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
            <Card title="Иконка">
              <div className="grid grid-cols-3 gap-2">
                {ICONS.map((i) => (
                  <button
                    key={i.value}
                    type="button"
                    aria-pressed={s.icon === i.value}
                    onClick={() => set("icon", i.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold transition-colors",
                      s.icon === i.value ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:border-ink/30",
                    )}
                  >
                    <Icon name={i.value} />
                    {i.label}
                  </button>
                ))}
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

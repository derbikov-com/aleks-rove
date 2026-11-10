"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { slugify } from "./format";
import { MediaPicker, previewSrc } from "./MediaPicker";
import type { Image, Metric, Seo } from "./types";
import { Button, Field, Input, Textarea, Toggle } from "./ui";

export type FieldErrors = Record<string, string>;

/** Список строк: пункты услуги, шаги решения, технологии. */
export function ListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      {hint && <p className="-mt-1 mb-2 text-sm text-muted">{hint}</p>}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-3 w-5 shrink-0 text-right text-sm font-bold tabular-nums text-muted">{i + 1}.</span>
            {multiline ? (
              <Textarea value={item} rows={2} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} aria-label={`${label}, пункт ${i + 1}`} />
            ) : (
              <Input value={item} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} aria-label={`${label}, пункт ${i + 1}`} />
            )}
            <div className="flex shrink-0 gap-1 pt-1">
              <IconBtn label="Выше" disabled={i === 0} onClick={() => move(i, -1)} icon="arrowRight" rotate="-rotate-90" />
              <IconBtn label="Ниже" disabled={i === items.length - 1} onClick={() => move(i, 1)} icon="arrowRight" rotate="rotate-90" />
              <IconBtn label="Удалить" onClick={() => onChange(items.filter((_, j) => j !== i))} icon="close" />
            </div>
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="sm" className="mt-2" onClick={() => onChange([...items, ""])}>
        <Icon name="plus" size={16} /> Добавить пункт
      </Button>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  icon,
  rotate,
  disabled,
}: {
  label: string;
  onClick: () => void;
  icon: "arrowRight" | "close";
  rotate?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink disabled:opacity-30"
    >
      <Icon name={icon} size={16} className={rotate} />
    </button>
  );
}

/** Результаты кейса: «−42%» + «время обработки заказа». */
export function MetricsEditor({ items, onChange }: { items: Metric[]; onChange: (items: Metric[]) => void }) {
  const set = (i: number, patch: Partial<Metric>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">Результаты в цифрах</p>
      <p className="-mt-1 mb-2 text-sm text-muted">Первый результат показывается на карточке кейса.</p>
      <ul className="space-y-2">
        {items.map((m, i) => (
          <li key={i} className="flex gap-2">
            <Input className="w-32 shrink-0" value={m.value} placeholder="−42%" onChange={(e) => set(i, { value: e.target.value })} aria-label="Значение" />
            <Input value={m.label} placeholder="время обработки заказа" onChange={(e) => set(i, { label: e.target.value })} aria-label="Подпись" />
            <IconBtn label="Удалить" onClick={() => onChange(items.filter((_, j) => j !== i))} icon="close" />
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="sm" className="mt-2" onClick={() => onChange([...items, { value: "", label: "" }])}>
        <Icon name="plus" size={16} /> Добавить результат
      </Button>
    </div>
  );
}

/** Адрес страницы: пусто — сгенерируется из заголовка. */
export function SlugField({
  value,
  onChange,
  title,
  prefix,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  title: string;
  prefix: string;
  error?: string;
}) {
  const auto = slugify(title);
  return (
    <Field
      label="Адрес страницы"
      error={error}
      hint={
        <>
          {prefix}
          <b className="text-ink">{value || auto || "…"}</b>
          {!value && " — сделаем из заголовка автоматически"}
        </>
      }
    >
      {(id) => (
        <Input
          id={id}
          value={value}
          placeholder={auto || "naprimer-adres-stranicy"}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          aria-invalid={!!error}
        />
      )}
    </Field>
  );
}

export function SeoFields({ value, onChange, fallbackTitle }: { value: Seo; onChange: (v: Seo) => void; fallbackTitle: string }) {
  const titleLen = (value.title || fallbackTitle).length;
  const descLen = (value.description ?? "").length;
  return (
    <div className="space-y-4">
      <Field label="Title" hint={`${titleLen} симв. · оптимально до 60. Пусто — возьмём заголовок`}>
        {(id) => <Input id={id} value={value.title ?? ""} placeholder={fallbackTitle} onChange={(e) => onChange({ ...value, title: e.target.value })} />}
      </Field>
      <Field label="Description" hint={`${descLen} симв. · оптимально 120–160`}>
        {(id) => (
          <Textarea id={id} rows={3} value={value.description ?? ""} onChange={(e) => onChange({ ...value, description: e.target.value })} />
        )}
      </Field>
      <Field label="Keywords" hint="Через запятую">
        {(id) => (
          <Input
            id={id}
            value={(value.keywords ?? []).join(", ")}
            onChange={(e) => onChange({ ...value, keywords: e.target.value.split(",").map((s) => s.trimStart()) })}
          />
        )}
      </Field>
      <Toggle checked={!!value.noindex} onChange={(v) => onChange({ ...value, noindex: v })} label="Скрыть от поисковиков" hint="noindex: страница не попадёт в выдачу" />
    </div>
  );
}

/** Перед отправкой: пустые строки и пробелы в ключевых словах убираем. */
export function cleanSeo(seo: Seo): Seo | undefined {
  const keywords = (seo.keywords ?? []).map((k) => k.trim()).filter(Boolean);
  const out: Seo = {
    title: seo.title?.trim() || undefined,
    description: seo.description?.trim() || undefined,
    keywords: keywords.length ? keywords : undefined,
    ogImage: seo.ogImage?.trim() || undefined,
    noindex: seo.noindex || undefined,
  };
  return Object.values(out).some((v) => v !== undefined) ? out : undefined;
}

/** Обложка: выбор из медиабиблиотеки, превью и alt. */
export function ImageField({ label, value, onChange, hint }: { label: string; value?: Image; onChange: (v?: Image) => void; hint?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      {value?.src ? (
        <div className="overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element -- превью в админке */}
          <img src={previewSrc(value.src)} alt={value.alt ?? ""} className="aspect-[16/9] w-full bg-paper object-cover" />
          <div className="space-y-3 p-3">
            <Input value={value.alt ?? ""} placeholder="Описание картинки для поисковиков и незрячих (alt)" onChange={(e) => onChange({ ...value, alt: e.target.value })} aria-label="Alt-текст" />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
                Заменить
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
                Убрать
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid aspect-[16/9] w-full place-items-center rounded-xl border-2 border-dashed border-line text-muted transition-colors hover:border-brand hover:text-brand"
        >
          <span className="text-center text-sm font-semibold">
            <Icon name="plus" className="mx-auto mb-1" />
            Выбрать или загрузить картинку
          </span>
        </button>
      )}
      {hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(m) => onChange({ src: m.url, alt: value?.alt || m.alt, width: m.width, height: m.height })}
      />
    </div>
  );
}
